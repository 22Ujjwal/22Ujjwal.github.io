#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Portfolio Website Setup & Test Helper${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env and add your GEMINI_API_KEY${NC}"
    echo "   nano .env"
    exit 1
fi

# Check if GEMINI_API_KEY is set
if grep -q "paste_your_gemini_api_key_here" .env; then
    echo -e "${RED}❌ GEMINI_API_KEY not configured!${NC}"
    echo -e "${YELLOW}📝 Please edit .env and replace the placeholder with your actual API key${NC}"
    echo "   Get it from: https://aistudio.google.com/app/apikey"
    echo ""
    echo "   nano .env"
    exit 1
fi

echo -e "${GREEN}✓ .env file configured${NC}\n"

# Install Node dependencies
echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Node dependencies installed${NC}\n"
else
    echo -e "${RED}❌ Failed to install Node dependencies${NC}"
    exit 1
fi

# Setup Python venv for testing
echo -e "${BLUE}🐍 Setting up Python virtual environment for testing...${NC}"
python3 -m venv venv

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Virtual environment created${NC}\n"
else
    echo -e "${RED}❌ Failed to create virtual environment${NC}"
    exit 1
fi

# Activate venv and install Python test dependencies
source venv/bin/activate
pip install -r requirements-test.txt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Python test dependencies installed${NC}\n"
else
    echo -e "${RED}❌ Failed to install Python dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  ✨ Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}\n"

echo -e "Next steps:\n"
echo -e "${BLUE}1️⃣  Start the Node server in one terminal:${NC}"
echo "   npm run dev\n"

echo -e "${BLUE}2️⃣  In another terminal, activate the venv and test:${NC}"
echo "   source venv/bin/activate"
echo "   python3 test_local.py\n"

echo -e "${BLUE}3️⃣  Open your browser to:${NC}"
echo "   http://localhost:3000\n"

echo -e "${YELLOW}Troubleshooting:${NC}"
echo "   - If 'port already in use', edit .env and change PORT=3001"
echo "   - If API errors, check your API key in .env"
echo "   - Server logs will show in the terminal where you ran 'npm run dev'\n"
