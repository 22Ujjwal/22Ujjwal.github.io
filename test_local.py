#!/usr/bin/env python3
"""
Local test script for the Gemini chatbot API.
Tests the server endpoint without needing to open a browser.
"""

import os
import sys
import json
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

def test_api_endpoint(api_key, base_url='http://localhost:3000'):
    """Test the /api/gemini endpoint."""
    
    print(f"🧪 Testing Gemini API endpoint at {base_url}/api/gemini")
    print("-" * 60)
    
    # Check if API key is set
    if not api_key:
        print("❌ ERROR: GEMINI_API_KEY not found in .env file")
        print("   Please set GEMINI_API_KEY in your .env file")
        return False
    
    print(f"✓ API Key found (length: {len(api_key)} chars)")
    
    # Check if server is running
    try:
        health_check = requests.get(base_url, timeout=2)
        print(f"✓ Server is running at {base_url}")
    except requests.exceptions.ConnectionError:
        print(f"❌ ERROR: Cannot connect to server at {base_url}")
        print(f"   Start the server with: npm run dev")
        return False
    except Exception as e:
        print(f"⚠️  Server check warning: {e}")
    
    # Test the API endpoint
    test_query = "Tell me about Ujjwal"
    payload = {
        "contents": [{
            "parts": [{
                "text": f"You are an AI assistant. Answer briefly: {test_query}"
            }]
        }]
    }
    
    try:
        print(f"\n📤 Sending test query: '{test_query}'")
        response = requests.post(
            f"{base_url}/api/gemini",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"📥 Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract the response text
            if 'candidates' in data and len(data['candidates']) > 0:
                if 'content' in data['candidates'][0] and 'parts' in data['candidates'][0]['content']:
                    text = data['candidates'][0]['content']['parts'][0].get('text', '')
                    print(f"\n✓ Success! AI Response:")
                    print(f"  {text[:200]}{'...' if len(text) > 200 else ''}")
                    return True
            
            print(f"\n⚠️  Unexpected response format:")
            print(json.dumps(data, indent=2)[:500])
            return False
        
        elif response.status_code == 429:
            print("❌ Rate limit exceeded. Try again later.")
            return False
        
        else:
            error_data = response.json()
            print(f"\n❌ API Error: {response.status_code}")
            print(f"   {error_data.get('error', 'Unknown error')}")
            if 'message' in error_data:
                print(f"   {error_data['message']}")
            if 'details' in error_data:
                print(f"   Details: {error_data['details']}")
            return False
    
    except requests.exceptions.Timeout:
        print("❌ ERROR: Request timed out (server took too long to respond)")
        return False
    
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Connection refused (server not running?)")
        print("   Start the server with: npm run dev")
        return False
    
    except json.JSONDecodeError:
        print("❌ ERROR: Server returned invalid JSON")
        print(f"   Response: {response.text[:200]}")
        return False
    
    except Exception as e:
        print(f"❌ ERROR: {type(e).__name__}: {e}")
        return False

def test_direct_call(api_key):
    """Test calling Gemini API directly (for debugging)."""
    
    print("\n\n🔧 Direct Gemini API Test (bypassing server)")
    print("-" * 60)
    
    if not api_key or api_key == 'paste_your_gemini_api_key_here':
        print("❌ ERROR: Invalid or missing GEMINI_API_KEY in .env")
        return False
    
    try:
        url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={api_key}"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": "Say 'API key works!' in 5 words or less."
                }]
            }]
        }
        
        print("📤 Calling Gemini API directly...")
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if 'candidates' in data and len(data['candidates']) > 0:
                text = data['candidates'][0]['content']['parts'][0].get('text', '')
                print(f"✓ Gemini API key is valid!")
                print(f"  Response: {text}")
                return True
        else:
            print(f"❌ Gemini API error: {response.status_code}")
            print(f"  {response.json()}")
            return False
    
    except Exception as e:
        print(f"❌ ERROR: {type(e).__name__}: {e}")
        return False

def main():
    """Run all tests."""
    
    api_key = os.getenv('GEMINI_API_KEY', '')
    
    print("\n" + "="*60)
    print("🚀 Gemini Chatbot Local Test Suite")
    print("="*60 + "\n")
    
    # Test 1: Direct API call
    direct_ok = test_direct_call(api_key)
    
    # Test 2: Server endpoint
    server_ok = test_api_endpoint(api_key)
    
    # Summary
    print("\n" + "="*60)
    print("📊 Test Summary")
    print("="*60)
    print(f"Direct API Call: {'✓ PASS' if direct_ok else '❌ FAIL'}")
    print(f"Server Endpoint: {'✓ PASS' if server_ok else '❌ FAIL'}")
    
    if direct_ok and server_ok:
        print("\n✨ All tests passed! Your setup is working correctly.")
        return 0
    else:
        print("\n⚠️  Some tests failed. See details above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
