"""
Serializers for users app.
"""
from rest_framework import serializers
from apps.users.models import User


class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    department_name = serializers.CharField(source='department.name_ar', read_only=True)

    # Permission flags for frontend role-based UI
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name_ar', 'name_en', 'role', 'role_display',
            'department', 'department_name', 'avatar', 'is_active',
            'date_joined', 'permissions',
        ]
        read_only_fields = ['id', 'date_joined', 'role', 'department']

    def get_permissions(self, obj):
        return {
            'can_add_product': obj.can_add_product(),
            'can_publish_product': obj.can_publish_product(),
            'can_generate_catalog': obj.can_generate_catalog(),
            'can_view_reports': obj.can_view_reports(),
            'can_manage_users': obj.can_manage_users(),
        }


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name_ar', 'name_en', 'avatar']
        read_only_fields = ['id', 'email']


class UserAdminSerializer(serializers.ModelSerializer):
    """Full serializer for Super Admin user management."""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    department_name = serializers.CharField(source='department.name_ar', read_only=True, default=None)
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name_ar', 'name_en', 'role', 'role_display',
            'department', 'department_name', 'is_active', 'avatar',
            'date_joined', 'last_login', 'permissions',
        ]

    def get_permissions(self, obj):
        return {
            'can_add_product': obj.can_add_product(),
            'can_publish_product': obj.can_publish_product(),
            'can_generate_catalog': obj.can_generate_catalog(),
            'can_view_reports': obj.can_view_reports(),
            'can_manage_users': obj.can_manage_users(),
        }


class CreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['email', 'name_ar', 'name_en', 'role', 'department', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
