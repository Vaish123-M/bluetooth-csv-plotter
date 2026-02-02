import requests
import json

# Test 1: Check if backend is running
try:
    response = requests.get('http://127.0.0.1:5000/')
    print("✅ Backend is accessible!")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except requests.exceptions.ConnectionError:
    print("❌ Backend connection failed!")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 2: Test CSV upload endpoint
try:
    with open('test_data.csv', 'rb') as f:
        files = {'file': f}
        response = requests.post('http://127.0.0.1:5000/upload_csv', files=files)
    print("\n✅ CSV upload test:")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Columns: {data.get('columns', [])}")
        print(f"Preview rows: {len(data.get('preview', []))}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"❌ CSV test error: {e}")