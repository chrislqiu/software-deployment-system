from django.contrib import admin
from .models import Package

@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ('name', 'version', 'os_compatibility', 'size', 'created_at', 'is_active')
    list_filter = ('os_compatibility', 'is_active')
    search_fields = ('name', 'version', 'description')
    readonly_fields = ('size', 'created_at')
