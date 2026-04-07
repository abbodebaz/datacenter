"""Approvals views."""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from apps.approvals.models import ProductApprovalRequest
from apps.approvals.serializers import ApprovalRequestSerializer
from apps.logs.utils import log_action


class ApprovalRequestViewSet(viewsets.ModelViewSet):
    queryset = ProductApprovalRequest.objects.select_related(
        'product', 'submitted_by', 'reviewed_by'
    ).order_by('-created_at')
    serializer_class = ApprovalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset

        if user.role != 'super_admin':
            qs = qs.filter(submitted_by=user)

        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status__in=status_filter.split(','))

        return qs

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Super admin approves → publishes the product."""
        if request.user.role != 'super_admin':
            return Response({'detail': 'غير مصرح.'}, status=status.HTTP_403_FORBIDDEN)

        approval = self.get_object()
        if approval.status in ('approved', 'rejected'):
            return Response(
                {'detail': 'تم البت في هذا الطلب مسبقاً.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        approval.status = 'approved'
        approval.reviewed_by = request.user
        approval.reviewer_notes = request.data.get('reviewer_notes', '')
        approval.reviewed_at = timezone.now()
        approval.save()

        product = approval.product
        product.status = 'نشط'
        product.published_at = timezone.now()
        product.updated_by = request.user
        product.save(update_fields=['status', 'published_at', 'updated_by', 'updated_at'])

        log_action(request.user, 'approval_approve', approval, f'موافقة على {product.sku}', request)
        return Response({'detail': 'تمت الموافقة ونُشر المنتج.'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Super admin rejects → reverts product to previous status."""
        if request.user.role != 'super_admin':
            return Response({'detail': 'غير مصرح.'}, status=status.HTTP_403_FORBIDDEN)

        approval = self.get_object()
        if approval.status in ('approved', 'rejected'):
            return Response(
                {'detail': 'تم البت في هذا الطلب مسبقاً.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        approval.status = 'rejected'
        approval.reviewed_by = request.user
        approval.reviewer_notes = request.data.get('reviewer_notes', '')
        approval.reviewed_at = timezone.now()
        approval.save()

        product = approval.product
        revert_status = approval.previous_status or 'مسودة'
        product.status = revert_status
        product.updated_by = request.user
        product.save(update_fields=['status', 'updated_by', 'updated_at'])

        log_action(request.user, 'approval_reject', approval, f'رفض {product.sku}', request)
        return Response({'detail': 'تم رفض الطلب وإعادة المنتج للحالة السابقة.'})
