// Auto-startup script for PDF Gears
(function() {
    'use strict';
    
    // Check if we're running locally
    if (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        
        // Try to start backend automatically
        function startBackend() {
            try {
                // For Electron or Node.js environments
                if (typeof require !== 'undefined') {
                    const { exec } = require('child_process');
                    const path = require('path');
                    
                    const commands = [
                        'python app.py',
                        'python3 app.py', 
                        'py app.py'
                    ];
                    
                    commands.forEach(cmd => {
                        exec(cmd, { cwd: __dirname }, (error, stdout, stderr) => {
                            if (!error) {
                                console.log('Backend started:', cmd);
                            }
                        });
                    });
                }
                
                // For browser environments - try to trigger batch file
                else if (navigator.platform.indexOf('Win') !== -1) {
                    // Windows - try to run batch file
                    const link = document.createElement('a');
                    link.href = 'start_backend.bat';
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                
            } catch (e) {
                console.log('Auto-start not available:', e.message);
            }
        }
        
        // Start backend after a short delay
        setTimeout(startBackend, 500);
        
        // Show instructions if backend doesn't start
        setTimeout(async function() {
            try {
                const response = await fetch('http://localhost:5000/api/status');
                if (!response.ok) {
                    throw new Error('Backend not running');
                }
            } catch (e) {
                showStartupInstructions();
            }
        }, 3000);
    }
    
    function showStartupInstructions() {
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 500px;
            text-align: center;
            border: 3px solid #667eea;
        `;
        
        instructions.innerHTML = `
            <h3 style="color: #667eea; margin-top: 0;">
                <i class="fas fa-rocket"></i> Quick Start
            </h3>
            <p>To enable all features, start the Python backend:</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <code style="font-size: 16px; color: #e83e8c;">python app.py</code>
            </div>
            <p style="font-size: 14px; color: #666;">
                Or double-click <strong>start_backend.bat</strong> (Windows)
            </p>
            <div style="margin-top: 20px;">
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-right: 10px;
                ">Got it!</button>
                <button onclick="window.open('start_backend.bat'); this.parentElement.parentElement.remove();" style="
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                ">Start Backend</button>
            </div>
        `;
        
        document.body.appendChild(instructions);
        
        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (instructions.parentElement) {
                instructions.remove();
            }
        }, 15000);
    }
    
})();