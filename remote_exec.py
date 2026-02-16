import pty
import os
import sys
import time

def remote_exec(command):
    # SSH Credentials
    HOST = "5.180.172.215"
    USER = "root"
    PASS = "8-8lJxTJ%Q"
    
    # Construct SSH command
    ssh_cmd = ["ssh", "-o", "StrictHostKeyChecking=no", f"{USER}@{HOST}", command]
    
    # Run via pty to handle password prompt
    pid, fd = pty.fork()
    
    if pid == 0:
        # Child: Replace process with ssh
        os.execvp(ssh_cmd[0], ssh_cmd)
    else:
        # Parent: Control the interaction
        output = b""
        password_sent = False
        
        while True:
            try:
                # Read 1KB at a time
                chunk = os.read(fd, 1024)
                if not chunk:
                    break
                
                output += chunk
                
                # Check for password prompt if not sent yet
                if not password_sent and b"password:" in output.lower():
                    os.write(fd, (PASS + "\n").encode())
                    password_sent = True
                    # Small sleep to ensure password is accepted
                    time.sleep(0.5) 
                    
            except OSError:
                break
                
        # Wait for child to exit
        os.waitpid(pid, 0)
        
        # Decode and print output (strip password prompt line if possible)
        try:
            print(output.decode('utf-8', errors='ignore'))
        except:
            print(output)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 remote_exec.py <command>")
        sys.exit(1)
        
    cmd = " ".join(sys.argv[1:])
    remote_exec(cmd)
