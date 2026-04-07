"""
Auth views — login, refresh, user profile, and user management.
"""
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q
from apps.users.models import User
from apps.users.serializers import UserSerializer, UserProfileSerializer, UserAdminSerializer, CreateUserSerializer


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'super_admin'


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'detail': 'البريد الإلكتروني وكلمة المرور مطلوبان.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(request, username=email, password=password)
        if not user:
            return Response(
                {'detail': 'بيانات الدخول غير صحيحة.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'detail': 'الحساب غير نشط. تواصل مع المدير.'},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)

        # Log login action
        from apps.logs.utils import log_action
        log_action(user, 'user_login', user, f'تسجيل دخول من {request.META.get("REMOTE_ADDR")}')

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListCreateView(APIView):
    """
    GET  /api/v1/users/  — list all users (super_admin only)
    POST /api/v1/users/  — create new user (super_admin only)
    """
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        qs = User.objects.all().order_by('-date_joined')
        search = request.query_params.get('search', '').strip()
        role = request.query_params.get('role', '').strip()
        is_active = request.query_params.get('is_active', '').strip()

        if search:
            qs = qs.filter(Q(name_ar__icontains=search) | Q(email__icontains=search))
        if role:
            qs = qs.filter(role=role)
        if is_active in ('true', 'false'):
            qs = qs.filter(is_active=(is_active == 'true'))

        # Simple pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        total = qs.count()
        start = (page - 1) * page_size
        end = start + page_size
        serializer = UserAdminSerializer(qs[start:end], many=True)
        return Response({
            'count': total,
            'results': serializer.data,
        })

    def post(self, request):
        serializer = CreateUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            from apps.logs.utils import log_action
            log_action(request.user, 'user_created', user, f'أنشأ المستخدم {user.email}')
            return Response(UserAdminSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):
    """
    GET    /api/v1/users/{id}/  — get user detail (super_admin only)
    PATCH  /api/v1/users/{id}/  — update role/dept/status (super_admin only)
    DELETE /api/v1/users/{id}/  — deactivate user (soft, super_admin only)
    """
    permission_classes = [IsSuperAdmin]

    def _get_user(self, pk, request):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self._get_user(pk, request)
        if not user:
            return Response({'detail': 'المستخدم غير موجود'}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserAdminSerializer(user).data)

    def patch(self, request, pk):
        user = self._get_user(pk, request)
        if not user:
            return Response({'detail': 'المستخدم غير موجود'}, status=status.HTTP_404_NOT_FOUND)
        # Prevent demoting self
        if user.pk == request.user.pk and request.data.get('role') and request.data['role'] != 'super_admin':
            return Response({'detail': 'لا يمكنك تغيير دورك بنفسك'}, status=status.HTTP_400_BAD_REQUEST)
        allowed_fields = {'role', 'department', 'is_active', 'name_ar', 'name_en'}
        data = {k: v for k, v in request.data.items() if k in allowed_fields}
        for field, value in data.items():
            setattr(user, field, value)
        user.save(update_fields=list(data.keys()))
        from apps.logs.utils import log_action
        log_action(request.user, 'user_updated', user, f'عدّل بيانات {user.email}')
        return Response(UserAdminSerializer(user).data)

    def delete(self, request, pk):
        user = self._get_user(pk, request)
        if not user:
            return Response({'detail': 'المستخدم غير موجود'}, status=status.HTTP_404_NOT_FOUND)
        if user.pk == request.user.pk:
            return Response({'detail': 'لا يمكنك حذف حسابك بنفسك'}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = False
        user.save(update_fields=['is_active'])
        from apps.logs.utils import log_action
        log_action(request.user, 'user_deactivated', user, f'عطّل حساب {user.email}')
        return Response({'detail': 'تم تعطيل الحساب'}, status=status.HTTP_200_OK)
