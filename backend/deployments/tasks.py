from celery import shared_task
from django.utils import timezone
from .models import Deployment, DeploymentStatus
import time

@shared_task
def process_deployment(deployment_id):
    """Process a deployment job."""
    deployment = Deployment.objects.get(id=deployment_id)
    statuses = deployment.deploymentstatus_set.filter(status='pending')

    for status in statuses:
        try:
            # Update status to in progress
            status.status = 'in_progress'
            status.started_at = timezone.now()
            status.save()

            # Simulate installation process
            time.sleep(5)  # Simulate some work
            
            # Log the progress
            status.log_output += f"[{timezone.now()}] Starting installation of {deployment.package.name}\n"
            status.log_output += f"[{timezone.now()}] Downloading package...\n"
            time.sleep(2)  # Simulate download
            status.log_output += f"[{timezone.now()}] Package downloaded successfully\n"
            status.log_output += f"[{timezone.now()}] Installing package...\n"
            time.sleep(3)  # Simulate installation
            status.log_output += f"[{timezone.now()}] Installation completed successfully\n"
            
            # Update status to completed
            status.status = 'completed'
            status.completed_at = timezone.now()
            status.save()

        except Exception as e:
            # Handle any errors
            status.status = 'failed'
            status.error_message = str(e)
            status.completed_at = timezone.now()
            status.log_output += f"[{timezone.now()}] Error: {str(e)}\n"
            status.save()

@shared_task
def check_scheduled_deployments():
    """Check for and process scheduled deployments."""
    now = timezone.now()
    scheduled_deployments = Deployment.objects.filter(
        scheduled_for__lte=now,
        deploymentstatus__status='pending'
    ).distinct()

    for deployment in scheduled_deployments:
        process_deployment.delay(deployment.id) 