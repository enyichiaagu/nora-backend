import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nora Backend API Documentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .header {
            background: linear-gradient(135deg, #1661ff 0%, #0d47a1 100%);
            color: white;
            padding: 3rem 2rem;
            text-align: center;
            border-radius: 12px;
            margin-bottom: 3rem;
            box-shadow: 0 8px 32px rgba(22, 97, 255, 0.3);
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .base-url {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 3rem;
            border-left: 4px solid #1661ff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .base-url h3 {
            color: #1661ff;
            margin-bottom: 0.5rem;
        }
        
        .base-url code {
            background: #f1f3f4;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 1.1rem;
            color: #d73a49;
        }
        
        .endpoint {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            border: 1px solid #e1e5e9;
        }
        
        .endpoint-header {
            display: flex;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #f1f3f4;
        }
        
        .method {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-weight: 700;
            font-size: 0.9rem;
            margin-right: 1rem;
            color: white;
            text-transform: uppercase;
        }
        
        .method.post {
            background: #28a745;
        }
        
        .endpoint-path {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 1.3rem;
            font-weight: 600;
            color: #333;
        }
        
        .section {
            margin-bottom: 2rem;
        }
        
        .section h4 {
            color: #1661ff;
            margin-bottom: 1rem;
            font-size: 1.2rem;
            font-weight: 600;
        }
        
        .param-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1.5rem;
            background: #f8f9fa;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .param-table th {
            background: #1661ff;
            color: white;
            padding: 1rem;
            text-align: left;
            font-weight: 600;
        }
        
        .param-table td {
            padding: 1rem;
            border-bottom: 1px solid #dee2e6;
        }
        
        .param-table tr:last-child td {
            border-bottom: none;
        }
        
        .param-name {
            font-family: 'Monaco', 'Menlo', monospace;
            font-weight: 600;
            color: #d73a49;
        }
        
        .param-type {
            background: #e3f2fd;
            color: #1565c0;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        .required {
            background: #ffebee;
            color: #c62828;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .optional {
            background: #f3e5f5;
            color: #7b1fa2;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .code-block {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 1.5rem;
            border-radius: 8px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9rem;
            overflow-x: auto;
            margin: 1rem 0;
        }
        
        .response-example {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1rem 0;
        }
        
        .status-code {
            display: inline-block;
            padding: 0.3rem 0.8rem;
            border-radius: 4px;
            font-weight: 600;
            font-size: 0.9rem;
            margin-right: 0.5rem;
        }
        
        .status-200 { background: #d4edda; color: #155724; }
        .status-400 { background: #f8d7da; color: #721c24; }
        .status-500 { background: #fff3cd; color: #856404; }
        
        .note {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 4px;
        }
        
        .note strong {
            color: #1565c0;
        }
        
        .toc {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .toc h3 {
            color: #1661ff;
            margin-bottom: 1rem;
        }
        
        .toc ul {
            list-style: none;
        }
        
        .toc li {
            margin-bottom: 0.5rem;
        }
        
        .toc a {
            color: #333;
            text-decoration: none;
            padding: 0.5rem;
            display: block;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        
        .toc a:hover {
            background: #f1f3f4;
            color: #1661ff;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Nora Backend API</h1>
            <p>Complete API documentation for frontend developers</p>
        </div>
        
        <div class="base-url">
            <h3>Production Base URL</h3>
            <code>https://nora-backend-production.up.railway.app</code>
        </div>
        
        <div class="toc">
            <h3>📋 Table of Contents</h3>
            <ul>
                <li><a href="#schedules">POST /schedules - Create Tutoring Session</a></li>
                <li><a href="#attachments">POST /attachments - Generate Lesson Notes</a></li>
            </ul>
        </div>
        
        <!-- SCHEDULES ENDPOINT -->
        <div class="endpoint" id="schedules">
            <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/schedules</span>
            </div>
            
            <p><strong>Description:</strong> Creates a new tutoring session, generates title/description using AI, and schedules email notifications.</p>
            
            <div class="section">
                <h4>📥 Request Body (JSON)</h4>
                <table class="param-table">
                    <thead>
                        <tr>
                            <th>Parameter</th>
                            <th>Type</th>
                            <th>Required</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><span class="param-name">userId</span></td>
                            <td><span class="param-type">string</span></td>
                            <td><span class="required">Required</span></td>
                            <td>User ID from Supabase auth</td>
                        </tr>
                        <tr>
                            <td><span class="param-name">duration</span></td>
                            <td><span class="param-type">number</span></td>
                            <td><span class="required">Required</span></td>
                            <td>Session duration in minutes</td>
                        </tr>
                        <tr>
                            <td><span class="param-name">conversation_context</span></td>
                            <td><span class="param-type">string</span></td>
                            <td><span class="required">Required</span></td>
                            <td>Context for AI to generate title/description</td>
                        </tr>
                        <tr>
                            <td><span class="param-name">tutor</span></td>
                            <td><span class="param-type">string</span></td>
                            <td><span class="required">Required</span></td>
                            <td>Tutor name</td>
                        </tr>
                        <tr>
                            <td><span class="param-name">replica_id</span></td>
                            <td><span class="param-type">string</span></td>
                            <td><span class="required">Required</span></td>
                            <td>Replica AI model ID</td>
                        </tr>
                        <tr>
                            <td><span class="param-name">tutor_image</span></td>
                            <td><span class="param-type">string</span></td>
                            <td><span class="required">Required</span></td>
                            <td>URL to tutor's profile image</td>
                        </tr>
                        <tr>
                            <td><span class="param-name">personal_id</span></td>
                            <td><span class="param-type">string</span></td>
                            <td><span class="required">Required</span></td>
                            <td>Personal identifier for the session</td>
                        </tr>
                        <tr>
                            <td><span class="param-name">tutor_personality</span></td>
                            <td><span class="param-type">string</span></td>
                            <td><span class="required">Required</span></td>
                            <td>Tutor's personality description</td>
                        </tr>
                        <tr>
                            <td><span class="param-name">scheduled_time</span></td>
                            <td><span class="param-type">string</span></td>
                            <td><span class="required">Required</span></td>
                            <td>ISO 8601 datetime string (must be in future)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h4>📤 Example Request</h4>
                <div class="code-block">POST https://nora-backend-production.up.railway.app/schedules
Content-Type: application/json

{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "duration": 60,
  "conversation_context": "Help me understand calculus derivatives and their applications in physics",
  "tutor": "Dr. Sarah Johnson",
  "replica_id": "replica_abc123",
  "tutor_image": "https://example.com/tutor.jpg",
  "personal_id": "student_456",
  "tutor_personality": "Patient and encouraging math professor",
  "scheduled_time": "2024-12-25T15:30:00Z"
}</div>
            </div>
            
            <div class="section">
                <h4>📨 Response Examples</h4>
                
                <div class="response-example">
                    <span class="status-code status-200">200 OK</span>
                    <strong>Success Response:</strong>
                    <div class="code-block">{
  "success": true,
  "session": {
    "id": "sess_789xyz",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "SCHEDULED",
    "scheduled_time": "2024-12-25T15:30:00Z",
    "duration": 60,
    "title": "Calculus Derivatives Physics Applications",
    "description": "Learn derivative concepts and their real-world physics applications.",
    "call_link": "https://noratutor.xyz/session/call/s123456789012345"
  },
  "user_email": "student@example.com"
}</div>
                </div>
                
                <div class="response-example">
                    <span class="status-code status-400">400 Bad Request</span>
                    <strong>Missing Fields:</strong>
                    <div class="code-block">{
  "error": "All fields are required: userId, duration, conversation_context, tutor, replica_id, tutor_image, personal_id, tutor_personality, scheduled_time"
}</div>
                </div>
                
                <div class="response-example">
                    <span class="status-code status-400">400 Bad Request</span>
                    <strong>Invalid Time:</strong>
                    <div class="code-block">{
  "error": "Scheduled time must be in the future"
}</div>
                </div>
            </div>
            
            <div class="note">
                <strong>Note:</strong> The system automatically sends email reminders 8-10 minutes before the scheduled session time. The AI generates a title (4 words) and description (9 words) based on the conversation context.
            </div>
        </div>
        
        <!-- ATTACHMENTS ENDPOINT -->
        <div class="endpoint" id="attachments">
            <div class="endpoint-header">
                <span class="method post">POST</span>
                <span class="endpoint-path">/attachments</span>
            </div>
            
            <p><strong>Description:</strong> Processes a file attachment with conversational context to generate comprehensive lesson notes using AI.</p>
            
            <div class="section">
                <h4>📥 Request Body (multipart/form-data)</h4>
                <table class="param-table">
                    <thead>
                        <tr>
                            <th>Parameter</th>
                            <th>Type</th>
                            <th>Required</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><span class="param-name">file</span></td>
                            <td><span class="param-type">File</span></td>
                            <td><span class="required">Required</span></td>
                            <td>File to process (max 10MB)</td>
                        </tr>
                        <tr>
                            <td><span class="param-name">conversational_context</span></td>
                            <td><span class="param-type">string</span></td>
                            <td><span class="required">Required</span></td>
                            <td>Discussion context to blend with file content</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h4>📁 Supported File Types</h4>
                <table class="param-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>MIME Types</th>
                            <th>Extensions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Images</strong></td>
                            <td>image/jpeg, image/png, image/gif, image/webp</td>
                            <td>.jpg, .jpeg, .png, .gif, .webp</td>
                        </tr>
                        <tr>
                            <td><strong>Documents</strong></td>
                            <td>application/pdf, text/plain, text/csv, application/json</td>
                            <td>.pdf, .txt, .csv, .json</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h4>📤 Example Request</h4>
                <div class="code-block">POST https://nora-backend-production.up.railway.app/attachments
Content-Type: multipart/form-data

--boundary123
Content-Disposition: form-data; name="file"; filename="math_diagram.png"
Content-Type: image/png

[binary file data]
--boundary123
Content-Disposition: form-data; name="conversational_context"

We discussed quadratic equations and their graphical representations. The student needs help understanding how to identify vertex, axis of symmetry, and roots from the graph.
--boundary123--</div>
            </div>
            
            <div class="section">
                <h4>📨 Response Examples</h4>
                
                <div class="response-example">
                    <span class="status-code status-200">200 OK</span>
                    <strong>Success Response:</strong>
                    <div class="code-block">{
  "generated_context": "Quadratic equations form parabolic curves when graphed, with key features easily identifiable from visual representation. The vertex represents the minimum or maximum point, located at the axis of symmetry which divides the parabola into two equal halves. From the attached diagram, we can observe how the parabola opens upward when the coefficient of x² is positive, creating a U-shaped curve. The roots or x-intercepts occur where the parabola crosses the x-axis, representing solutions to the equation when y equals zero. The y-intercept shows where the parabola crosses the vertical axis, corresponding to the constant term in the equation. Understanding these visual elements helps solve quadratic problems more intuitively. The axis of symmetry can be found using the formula x = -b/2a, while the vertex coordinates provide crucial information about the function's behavior. Discriminant analysis from the quadratic formula reveals whether roots are real, repeated, or complex based on the parabola's position relative to the x-axis. This visual approach to quadratic equations bridges algebraic manipulation with geometric understanding, making abstract concepts more concrete and accessible for problem-solving applications."
}</div>
                </div>
                
                <div class="response-example">
                    <span class="status-code status-400">400 Bad Request</span>
                    <strong>Missing File:</strong>
                    <div class="code-block">{
  "error": "File is required"
}</div>
                </div>
                
                <div class="response-example">
                    <span class="status-code status-400">400 Bad Request</span>
                    <strong>Missing Context:</strong>
                    <div class="code-block">{
  "error": "conversational_context is required"
}</div>
                </div>
                
                <div class="response-example">
                    <span class="status-code status-500">500 Internal Server Error</span>
                    <strong>Processing Error:</strong>
                    <div class="code-block">{
  "error": "Failed to process attachment and generate lesson notes"
}</div>
                </div>
            </div>
            
            <div class="section">
                <h4>💻 JavaScript Example</h4>
                <div class="code-block">// Example using fetch API
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('conversational_context', 'Your discussion context here');

const response = await fetch('https://nora-backend-production.up.railway.app/attachments', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.generated_context); // 200-word lesson notes</div>
            </div>
            
            <div class="note">
                <strong>Important:</strong> The AI generates exactly 200 words of lesson notes that blend the file content with the conversational context. Files are automatically cleaned up after processing. Ensure proper error handling for file size limits and unsupported formats.
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 3rem; padding: 2rem; background: white; border-radius: 8px;">
            <p style="color: #666;">
                <strong>Need help?</strong> Contact the backend team for additional API endpoints or support.
            </p>
        </div>
    </div>
</body>
</html>
  `);
});

export { router as docsRouter };