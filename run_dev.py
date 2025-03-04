import subprocess
import sys
import os
import time
import webbrowser
from typing import Optional

def check_node_installed() -> bool:
    try:
        subprocess.run(['node', '--version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def run_npm_command(command: str) -> Optional[subprocess.Popen]:
    try:
        # On Windows, we need shell=True
        shell = sys.platform == 'win32'
        
        # Run the npm command
        process = subprocess.Popen(
            f"npm {command}",
            shell=shell,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        return process
    except subprocess.CalledProcessError as e:
        print(f"Error running npm command: {e}")
        return None

def main():
    # Check if Node.js is installed
    if not check_node_installed():
        print("Node.js is not installed. Please install Node.js to run this application.")
        sys.exit(1)

    # Install dependencies if node_modules doesn't exist
    if not os.path.exists('node_modules'):
        print("Installing dependencies...")
        subprocess.run(['npm', 'install'], check=True)

    # Start the development server
    print("Starting development server...")
    dev_process = run_npm_command('run dev')
    
    if dev_process:
        try:
            # Wait a few seconds for the server to start
            time.sleep(5)
            
            # Open the browser
            webbrowser.open('http://localhost:8085')
            
            # Keep the script running
            dev_process.wait()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            dev_process.terminate()
            dev_process.wait()
    else:
        print("Failed to start development server.")

if __name__ == "__main__":
    main() 