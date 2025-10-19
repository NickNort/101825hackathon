# Claude Agent User Guide

This guide explains how to use the Claude Agent web interface and API, including the new skills functionality.

## Web Interface Usage

### Getting Started

1. **Open the application** in your web browser
2. **Enter your API key** in the API Key field
3. **Select skills** (optional) from the available Anthropic skills
4. **Enter a custom skill ID** (optional) if you have a custom skill
5. **Set a session ID** (optional) to maintain conversation context
6. **Start chatting** with Claude!

### Skills Configuration

#### Anthropic Skills
The interface shows available Anthropic skills that you can enable:
- **PowerPoint Generator** - Creates PowerPoint presentations
- **Excel Generator** - Creates Excel spreadsheets  
- **Word Generator** - Creates Word documents
- **PDF Generator** - Creates PDF documents

Simply check the boxes next to the skills you want to use.

#### Custom Skills
If you have a custom skill created through the API:
1. Enter the skill ID in the "Custom Skill ID" field
2. The skill will be used in your conversations

#### Session Management
- **Session ID**: Enter a unique identifier to maintain conversation context
- **Container ID**: Automatically managed - shows when a container is active
- **Multi-turn conversations**: Skills and context persist across multiple messages

### File Downloads

When Claude generates files using skills:
1. **Generated Files section** appears below the chat
2. **Download buttons** show for each generated file
3. **Click to download** - files are automatically saved to your device

### Conversation Flow

1. **Type your message** in the input field
2. **Press Enter** or click Send
3. **Claude responds** with text and potentially files
4. **Files appear** in the Generated Files section
5. **Continue the conversation** - context is maintained

## API Usage

### Basic Chat Request

```bash
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "messages": [
      {"role": "user", "content": "Create a PowerPoint about AI trends"}
    ]
  }'
```

### Chat with Skills

```bash
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "messages": [
      {"role": "user", "content": "Create a PowerPoint about AI trends"}
    ],
    "skills": [
      {
        "type": "anthropic",
        "skill_id": "skill_pptx_20241002"
      }
    ],
    "session_id": "my_session_123"
  }'
```

### Skills Management

#### List Available Skills

```bash
curl -X GET https://your-app.vercel.app/api/skills \
  -H "X-API-Key: your_api_key"
```

#### List Only Anthropic Skills

```bash
curl -X GET "https://your-app.vercel.app/api/skills?source=anthropic" \
  -H "X-API-Key: your_api_key"
```

#### Create Custom Skill

```bash
curl -X POST https://your-app.vercel.app/api/skills \
  -H "X-API-Key: your_api_key" \
  -F "files=@SKILL.md" \
  -F "files=@script.py" \
  -F "files=@reference.pdf"
```

#### Get Skill Details

```bash
curl -X GET https://your-app.vercel.app/api/skills/skill_123 \
  -H "X-API-Key: your_api_key"
```

#### Delete Skill

```bash
curl -X DELETE https://your-app.vercel.app/api/skills/skill_123 \
  -H "X-API-Key: your_api_key"
```

### File Management

#### List Files

```bash
curl -X GET https://your-app.vercel.app/api/files \
  -H "X-API-Key: your_api_key"
```

#### Get File Metadata

```bash
curl -X GET https://your-app.vercel.app/api/files/file_123 \
  -H "X-API-Key: your_api_key"
```

#### Download File

```bash
curl -X GET https://your-app.vercel.app/api/files/file_123/content \
  -H "X-API-Key: your_api_key" \
  -o downloaded_file.pptx
```

#### Delete File

```bash
curl -X DELETE https://your-app.vercel.app/api/files/file_123 \
  -H "X-API-Key: your_api_key"
```

## Creating Custom Skills

### Skill Structure

A custom skill must include:

1. **SKILL.md** (required) - Main skill definition
2. **scripts/** (optional) - Executable code
3. **references/** (optional) - Documentation
4. **assets/** (optional) - Templates and resources

### SKILL.md Format

```markdown
---
name: "My Custom Skill"
description: "This skill helps with specific tasks"
---

# My Custom Skill

This skill should be used when you need to perform specific tasks.

## Usage

To use this skill:
1. Do this
2. Then do that
3. Finally do this

## Examples

- Example 1: Description
- Example 2: Description
```

### Uploading Skills

1. **Prepare your files** in the correct structure
2. **Create a zip file** or prepare individual files
3. **Use the API** to upload with multipart form data
4. **Get the skill ID** from the response
5. **Use the skill ID** in your conversations

## Error Handling

### Common Errors

#### Authentication Errors
- **401 Unauthorized**: Check your API key
- **Invalid API key**: Verify the key is in ALLOWED_API_KEYS

#### Rate Limiting
- **429 Too Many Requests**: Wait 60 seconds before retrying
- Reduce request frequency

#### File Errors
- **File too large**: Skills must be under 8MB
- **Missing SKILL.md**: All custom skills need a SKILL.md file
- **Download failed**: Check file ID and permissions

#### Skills Errors
- **Skill not found**: Verify skill ID exists
- **Invalid skill type**: Use 'anthropic' or 'custom'
- **Version conflicts**: Delete old versions before creating new ones

### Debugging Tips

1. **Check the browser console** for client-side errors
2. **Verify API keys** are correctly set
3. **Test with simple requests** first
4. **Check file permissions** for uploads
5. **Verify skill structure** matches requirements

## Best Practices

### Performance
- **Use session IDs** for multi-turn conversations
- **Reuse containers** when possible
- **Clean up old files** regularly
- **Monitor rate limits**

### Security
- **Keep API keys secure** - never expose in client code
- **Use strong session IDs** for conversation tracking
- **Validate file uploads** before processing
- **Regularly rotate API keys**

### Skills Development
- **Test skills thoroughly** before deployment
- **Keep SKILL.md concise** but informative
- **Use descriptive names** and descriptions
- **Version your skills** for easy management

## Troubleshooting

### Skills Not Working
1. Check if skill ID is correct
2. Verify skill is properly uploaded
3. Ensure skill has valid SKILL.md
4. Check if skill is compatible with current model

### Files Not Downloading
1. Verify file ID is correct
2. Check if file still exists
3. Ensure proper authentication
4. Try different browser/incognito mode

### Conversations Not Continuing
1. Check session ID is consistent
2. Verify container ID is being returned
3. Ensure skills configuration matches
4. Check for pause_turn responses

### API Errors
1. Verify all required headers
2. Check request body format
3. Ensure proper authentication
4. Review rate limiting status

## Support

For additional help:
- Check the main README.md for technical details
- Review API documentation for endpoint specifics
- Contact your administrator for API key issues
- Check Vercel logs for deployment problems
