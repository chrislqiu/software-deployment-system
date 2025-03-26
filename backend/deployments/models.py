from django.db import models
from django.contrib.auth.models import User
from clients.models import Client
from packages.models import Package

class Deployment(models.Model):
    package = models.ForeignKey(Package, on_delete=models.CASCADE)
    clients = models.ManyToManyField(Client, through='DeploymentStatus')
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    scheduled_for = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Deployment of {self.package.name} to {self.clients.count()} clients"

class DeploymentStatus(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    deployment = models.ForeignKey(Deployment, on_delete=models.CASCADE, related_name='deployment_statuses')
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    log_output = models.TextField(blank=True)

    class Meta:
        unique_together = ('deployment', 'client')
        ordering = ['-started_at']

    def __str__(self):
        return f"Deployment {self.deployment.id} to {self.client.hostname}: {self.status}"
