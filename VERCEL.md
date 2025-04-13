# Deploying Your Portfolio Website to Vercel

This guide provides step-by-step instructions to successfully deploy your portfolio website with the Gemini AI chatbot to Vercel.

## Prerequisites

1. A GitHub account with your repository pushed
2. A Vercel account (can sign up with GitHub)
3. A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Step 1: Prepare Your Repository

Make sure your repository includes these key files:
- `vercel.json` - Configuration for Vercel deployment
- `package.json` - With correct dependencies and scripts
- `api/gemini.js` - The serverless function for the Gemini API
- `.gitignore` - Should include `.env` to prevent pushing your API key

## Step 2: Import Your Project to Vercel

1. Log in to [Vercel](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Select the GitHub repository containing your portfolio
4. If you don't see your repository, you may need to configure Vercel GitHub permissions

## Step 3: Configure Project Settings

In the "Configure Project" screen:

1. **Framework Preset**: Select "Other"
2. **Build and Output Settings**:
   - Build Command: Leave empty (or `npm run build` if you have a build process)
   - Output Directory: Leave empty
   - Install Command: `npm install`
   - Root Directory: `.` (default)

3. **Environment Variables**:
   - Click "Environment Variables"
   - Add variable:
     - NAME: `GEMINI_API_KEY`
     - VALUE: Your Gemini API key from Google AI Studio
   - Make sure it's added to all environments (Production, Preview, Development)

## Step 4: Deploy

Click the "Deploy" button and wait for the deployment to complete.

## Step 5: Verify Deployment

1. Once deployment is complete, Vercel will provide a URL to your site
2. Open the URL and test your chatbot functionality
3. If there are issues, check the "Deployments" tab, click on your deployment, and view the logs

## Troubleshooting

### Error: "pages build and deployment" failed

This error occurs when GitHub is trying to deploy to GitHub Pages because of your repository name (username.github.io).

**Solution**:
1. Go to your GitHub repository
2. Navigate to "Settings" → "Pages"
3. Under "Build and deployment" → "Source", select "GitHub Actions" or "Deploy from a branch" and then select "None" for the branch
4. Alternatively, consider renaming your repository to something other than "username.github.io"

### Chatbot Not Working

If the chatbot is displayed but shows error messages:

1. **Check logs in Vercel**:
   - Go to your project on Vercel
   - Select "Deployments" and click on your latest deployment
   - Select "Functions" and check for errors in the "api/gemini" function

2. **Verify API key**:
   - Make sure your Gemini API key is correctly set in Vercel environment variables
   - Check that your API key has access to the model (gemini-1.5-flash)
   - Ensure you're using a v1 API key, not v1beta

3. **Test locally**:
   - Run `node server.js` locally with a `.env` file containing your API key
   - Open your browser to http://localhost:3000 to test

### CORS Errors

If you see CORS errors in the browser console:

1. Check your `vercel.json` file to ensure it has the proper CORS headers
2. Try adding your specific domain to the "Access-Control-Allow-Origin" header

## Going Further

- Add a custom domain in Vercel settings
- Set up a CI/CD workflow in GitHub for more complex deployments
- Implement analytics to track chatbot usage

## Help and Support

If you encounter issues:
1. Check Vercel documentation at https://vercel.com/docs
2. Review the Gemini API documentation at https://ai.google.dev/docs
3. Look for error messages in browser console and server logs 