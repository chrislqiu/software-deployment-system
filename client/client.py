import requests
import socket
import platform
import time
import json
import logging
from datetime import datetime
import os
from configparser import ConfigParser

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('client.log'),
        logging.StreamHandler()
    ]
)

class DeploymentClient:
    def __init__(self, config_file='config.ini'):
        self.config = self._load_config(config_file)
        self.token = None
        self.client_id = None
        self.base_url = self.config['server']['base_url'].rstrip('/')
        self.headers = {
            'Content-Type': 'application/json'
        }

    def _load_config(self, config_file):
        if not os.path.exists(config_file):
            # Create default config
            config = ConfigParser()
            config['server'] = {
                'base_url': 'http://localhost:8000',
                'username': 'client',
                'password': 'client_password'
            }
            with open(config_file, 'w') as f:
                config.write(f)
        
        config = ConfigParser()
        config.read(config_file)
        return config

    def authenticate(self):
        """Authenticate with the server and get token."""
        try:
            response = requests.post(
                f"{self.base_url}/api/token/",
                json={
                    'username': self.config['server']['username'],
                    'password': self.config['server']['password']
                }
            )
            response.raise_for_status()
            self.token = response.json()['token']
            self.headers['Authorization'] = f'Token {self.token}'
            logging.info("Authentication successful")
        except Exception as e:
            logging.error(f"Authentication failed: {str(e)}")
            raise

    def register(self):
        """Register the client with the server."""
        try:
            hostname = socket.gethostname()
            ip_address = socket.gethostbyname(hostname)
            system_info = {
                'hostname': hostname,
                'ip_address': ip_address,
                'os_type': platform.system().lower(),
                'os_version': platform.version()
            }

            # Check if already registered
            response = requests.get(
                f"{self.base_url}/api/clients/",
                headers=self.headers,
                params={'search': hostname}
            )
            response.raise_for_status()
            clients = response.json()

            if clients:
                self.client_id = clients[0]['id']
                logging.info(f"Client already registered with ID: {self.client_id}")
            else:
                # Register new client
                response = requests.post(
                    f"{self.base_url}/api/clients/",
                    headers=self.headers,
                    json=system_info
                )
                response.raise_for_status()
                self.client_id = response.json()['id']
                logging.info(f"Successfully registered with ID: {self.client_id}")

        except Exception as e:
            logging.error(f"Registration failed: {str(e)}")
            raise

    def check_in(self):
        """Update client status on server."""
        try:
            response = requests.post(
                f"{self.base_url}/api/clients/{self.client_id}/checkin/",
                headers=self.headers
            )
            response.raise_for_status()
            logging.info("Successfully checked in with server")
        except Exception as e:
            logging.error(f"Check-in failed: {str(e)}")

    def check_deployments(self):
        """Check for pending deployments."""
        try:
            response = requests.get(
                f"{self.base_url}/api/deployment-status/",
                headers=self.headers,
                params={
                    'client': self.client_id,
                    'status': 'pending'
                }
            )
            response.raise_for_status()
            deployments = response.json()

            for deployment in deployments:
                self._process_deployment(deployment)

        except Exception as e:
            logging.error(f"Failed to check deployments: {str(e)}")

    def _process_deployment(self, deployment):
        """Process a deployment."""
        try:
            logging.info(f"Processing deployment: {deployment['id']}")
            
            # Simulate installation process
            time.sleep(5)  # Simulate work
            
            # Update deployment status
            response = requests.patch(
                f"{self.base_url}/api/deployment-status/{deployment['id']}/",
                headers=self.headers,
                json={
                    'status': 'completed',
                    'completed_at': datetime.utcnow().isoformat(),
                    'log_output': 'Installation completed successfully'
                }
            )
            response.raise_for_status()
            logging.info(f"Deployment {deployment['id']} completed successfully")

        except Exception as e:
            logging.error(f"Deployment failed: {str(e)}")
            # Update deployment status as failed
            try:
                requests.patch(
                    f"{self.base_url}/api/deployment-status/{deployment['id']}/",
                    headers=self.headers,
                    json={
                        'status': 'failed',
                        'completed_at': datetime.utcnow().isoformat(),
                        'error_message': str(e)
                    }
                )
            except Exception as update_error:
                logging.error(f"Failed to update deployment status: {str(update_error)}")

def main():
    client = DeploymentClient()
    
    try:
        # Initial setup
        client.authenticate()
        client.register()

        # Main loop
        while True:
            client.check_in()
            client.check_deployments()
            time.sleep(60)  # Wait for 1 minute before next check

    except KeyboardInterrupt:
        logging.info("Client shutting down")
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        raise

if __name__ == "__main__":
    main() 