#!/usr/bin/env node

// Simple test script for backend APIs
const https = require('http');

const baseUrl = 'http://localhost:5000';

async function testAPI() {
    console.log('Testing backend APIs...\n');
    
    // Test 1: Register a user
    console.log('1️⃣ Testing user registration...');
    try {
        const registerData = {
            username: 'testuser' + Date.now(),
            email: `test${Date.now()}@example.com`,
            password: 'password123'
        };
        
        const registerResponse = await makeRequest('/api/auth/register', 'POST', registerData);
        
        if (registerResponse.success) {
            console.log('✅ Registration successful!');
            console.log(`   User: ${registerResponse.data.user.username}`);
            console.log(`   Token: ${registerResponse.data.token.substring(0, 20)}...`);
            
            // Test 2: Use the token to create a mood entry
            console.log('\n2️⃣ Testing mood entry with authentication...');
            const moodResponse = await makeRequest('/api/mood', 'POST', {
                moodValue: 4,
                notes: 'Feeling good after setting up the backend stack!'
            }, registerResponse.data.token);
            
            if (moodResponse.success) {
                console.log('✅ Mood entry successful!');
            } else {
                console.log('❌ Mood entry failed:', moodResponse.error || 'Unknown error');
            }
            
            // Test 3: Create a goal
            console.log('\n3️⃣ Testing goal creation...');
            const goalResponse = await makeRequest('/api/goals', 'POST', {
                title: 'Learn Full Stack Development',
                description: 'Master MySQL, Express, React, and Node.js',
                category: 'academic'
            }, registerResponse.data.token);
            
            if (goalResponse.success) {
                console.log('✅ Goal creation successful!');
            } else {
                console.log('❌ Goal creation failed:', goalResponse.error || 'Unknown error');
            }
            
        } else {
            console.log('❌ Registration failed:', registerResponse.error || 'Unknown error');
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
    
    console.log('\nBackend API testing complete!');
    console.log('Note: Tests may fail if MySQL is not connected, but the server should report the issue gracefully.');
}

function makeRequest(path, method = 'GET', data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({
                        success: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        data: parsed
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        error: 'Invalid JSON response: ' + responseData
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            resolve({
                success: false,
                error: error.message
            });
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Run the test
testAPI();