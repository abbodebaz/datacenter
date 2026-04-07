"""
Custom User model for Bayt Alebaa PDC.
5 roles: عام / مبيعات / مدير_قسم / تسويق / super_admin
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserRole(models.TextChoices):
    PUBLIC = 'عام', 'عام (عميل / زائر)'
    SALES = 'مبيعات', 'مندوب مبيعات'
    DEPT_MANAGER = 'مدير_قسم', 'مدير قسم'
    MARKETING = 'تسويق', 'فريق التسويق'
    SUPER_ADMIN = 'super_admin', 'Super Admin'


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('البريد الإلكتروني مطلوب')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', UserRole.SUPER_ADMIN)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, verbose_name='البريد الإلكتروني')
    name_ar = models.CharField(max_length=100, verbose_name='الاسم بالعربية')
    name_en = models.CharField(max_length=100, blank=True, verbose_name='Name in English')
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.PUBLIC,
        verbose_name='الدور'
    )
    # Department scope for مدير_قسم - they can only see their own category
    department = models.ForeignKey(
        'categories.Category',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='managers',
        verbose_name='القسم المسؤول عنه'
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    avatar = models.URLField(blank=True, verbose_name='الصورة الشخصية')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name_ar']

    objects = UserManager()

    class Meta:
        verbose_name = 'مستخدم'
        verbose_name_plural = 'المستخدمون'
        ordering = ['-date_joined']

    def __str__(self):
        return f'{self.name_ar} ({self.get_role_display()})'

    @property
    def is_super_admin(self):
        return self.role == UserRole.SUPER_ADMIN

    @property
    def is_dept_manager(self):
        return self.role == UserRole.DEPT_MANAGER

    @property
    def is_marketing(self):
        return self.role == UserRole.MARKETING

    @property
    def is_sales(self):
        return self.role == UserRole.SALES

    def can_add_product(self):
        return self.role in [UserRole.DEPT_MANAGER, UserRole.SUPER_ADMIN]

    def can_publish_product(self):
        return self.role == UserRole.SUPER_ADMIN

    def can_generate_catalog(self):
        return self.role in [UserRole.SALES, UserRole.DEPT_MANAGER, UserRole.MARKETING, UserRole.SUPER_ADMIN]

    def can_view_reports(self):
        return self.role in [UserRole.DEPT_MANAGER, UserRole.SUPER_ADMIN]

    def can_manage_users(self):
        return self.role == UserRole.SUPER_ADMIN
