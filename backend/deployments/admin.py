from django.contrib import admin
from .models import Deployment, DeploymentStatus

class DeploymentStatusInline(admin.TabularInline):
    model = DeploymentStatus
    extra = 0
    readonly_fields = ('started_at', 'completed_at')

@admin.register(Deployment)
class DeploymentAdmin(admin.ModelAdmin):
    list_display = ('package', 'created_at', 'scheduled_for')
    list_filter = ('created_at', 'scheduled_for')
    search_fields = ('package__name', 'description')
    inlines = [DeploymentStatusInline]

@admin.register(DeploymentStatus)
class DeploymentStatusAdmin(admin.ModelAdmin):
    list_display = ('deployment', 'client', 'status', 'started_at', 'completed_at')
    list_filter = ('status', 'started_at', 'completed_at')
    search_fields = ('deployment__package__name', 'client__hostname', 'error_message')
    readonly_fields = ('started_at', 'completed_at')
