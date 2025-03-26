# Register your models here.
# In backend/clients/admin.py
from django.contrib import admin
from .models import Client

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('hostname', 'ip_address', 'os_type', 'status', 'last_seen')
    list_filter = ('status', 'os_type')
    search_fields = ('hostname', 'ip_address')