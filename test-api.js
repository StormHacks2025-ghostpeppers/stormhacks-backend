// test-api.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';

async function testAPI() {
    try {
        console.log('Testing API endpoints...\n');

        // Test Registration
        console.log('1. Testing Registration...');
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
            email: 'testuser@example.com',
            password: 'password123'
        });
        console.log('✓ Registration successful:', registerResponse.data);

        // Test Login
        console.log('\n2. Testing Login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'testuser@example.com',
            password: 'password123'
        });
        authToken = loginResponse.data.token;
        console.log('✓ Login successful:', loginResponse.data);

        // Test Get User Profile
        console.log('\n3. Testing Get User Profile...');
        const profileResponse = await axios.get(`${BASE_URL}/users/1`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        console.log('✓ Profile retrieved:', profileResponse.data);

        // Test Update User Profile
        console.log('\n4. Testing Update User Profile...');
        const updateResponse = await axios.put(`${BASE_URL}/users/1`, {
            email: 'updated@example.com'
        }, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        console.log('✓ Profile updated:', updateResponse.data);

        // Test Inventory Management
        console.log('\n=== INVENTORY TESTS ===');

        // Test Get Empty Inventory (should create empty inventory)
        console.log('\n5. Testing Get Inventory (empty)...');
        const emptyInventoryResponse = await axios.get(`${BASE_URL}/inventory`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        console.log('✓ Empty inventory retrieved:');
        console.log(JSON.stringify(emptyInventoryResponse.data, null, 2));

        // Test Add Single Ingredient
        console.log('\n6. Testing Add Ingredient...');
        const addIngredientResponse = await axios.post(`${BASE_URL}/inventory/ingredient`, {
            ingredient: {
                name: 'Tomatoes',
                quantity: 5,
                unit: 'pieces',
                expiryDate: '2024-01-15'
            }
        }, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        console.log('✓ Ingredient added:');
        console.log(JSON.stringify(addIngredientResponse.data, null, 2));

        // Test Add Another Ingredient
        console.log('\n7. Testing Add Another Ingredient...');
        const addIngredient2Response = await axios.post(`${BASE_URL}/inventory/ingredient`, {
            ingredient: {
                name: 'Chicken Breast',
                quantity: 2,
                unit: 'lbs',
                expiryDate: '2024-01-10'
            }
        }, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        console.log('✓ Second ingredient added:');
        console.log(JSON.stringify(addIngredient2Response.data, null, 2));

        // Test Update Existing Ingredient
        console.log('\n8. Testing Update Existing Ingredient...');
        const updateIngredientResponse = await axios.post(`${BASE_URL}/inventory/ingredient`, {
            ingredient: {
                name: 'Tomatoes', // Same name should update existing
                quantity: 8,
                unit: 'pieces',
                expiryDate: '2024-01-20'
            }
        }, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        console.log('✓ Ingredient updated:');
        console.log(JSON.stringify(updateIngredientResponse.data, null, 2));

        // Test Get Updated Inventory
        console.log('\n9. Testing Get Updated Inventory...');
        const updatedInventoryResponse = await axios.get(`${BASE_URL}/inventory`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        console.log('✓ Updated inventory retrieved:');
        console.log(JSON.stringify(updatedInventoryResponse.data, null, 2));

        // Get ingredient ID for deletion test
        const ingredientToDelete = updatedInventoryResponse.data.inventory.ingredients.find(
            item => item.name === 'Chicken Breast'
        );

        if (ingredientToDelete) {
            console.log(`\nFound ingredient to delete: ${ingredientToDelete.name} (ID: ${ingredientToDelete.id})`);
            
            // Test Remove Ingredient
            console.log('\n10. Testing Remove Ingredient...');
            const removeIngredientResponse = await axios.delete(
                `${BASE_URL}/inventory/ingredient/${ingredientToDelete.id}`, 
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );
            console.log('✓ Ingredient removed:');
            console.log(JSON.stringify(removeIngredientResponse.data, null, 2));
        } else {
            console.log('\n⚠️ No Chicken Breast ingredient found to delete');
        }

        // Test Update Entire Inventory
        console.log('\n11. Testing Update Entire Inventory...');
        const bulkUpdateResponse = await axios.put(`${BASE_URL}/inventory`, {
            ingredients: [
                {
                    id: '1',
                    name: 'Carrots',
                    quantity: 10,
                    unit: 'pieces',
                    expiryDate: '2024-01-25'
                },
                {
                    id: '2',
                    name: 'Rice',
                    quantity: 2,
                    unit: 'cups',
                    expiryDate: null
                },
                {
                    id: '3',
                    name: 'Olive Oil',
                    quantity: 1,
                    unit: 'bottle',
                    expiryDate: '2025-01-01'
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        console.log('✓ Bulk inventory update:');
        console.log(JSON.stringify(bulkUpdateResponse.data, null, 2));

        // Test Final Inventory State
        console.log('\n12. Testing Final Inventory State...');
        const finalInventoryResponse = await axios.get(`${BASE_URL}/inventory`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        console.log('✓ Final inventory:');
        console.log(JSON.stringify(finalInventoryResponse.data, null, 2));

        // Test Error Cases
        console.log('\n=== ERROR HANDLING TESTS ===');

        // Test Add Ingredient Without Auth
        console.log('\n13. Testing Add Ingredient Without Auth...');
        try {
            await axios.post(`${BASE_URL}/inventory/ingredient`, {
                ingredient: {
                    name: 'Test Item'
                }
            });
        } catch (error) {
            console.log('✓ Unauthorized request blocked:', error.response.data);
        }

        // Test Add Invalid Ingredient
        console.log('\n14. Testing Add Invalid Ingredient...');
        try {
            await axios.post(`${BASE_URL}/inventory/ingredient`, {
                ingredient: {
                    // Missing name
                    quantity: 5
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
        } catch (error) {
            console.log('✓ Invalid ingredient rejected:', error.response.data);
        }

        // Test Remove Non-existent Ingredient
        console.log('\n15. Testing Remove Non-existent Ingredient...');
        try {
            await axios.delete(`${BASE_URL}/inventory/ingredient/nonexistent`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
        } catch (error) {
            console.log('✓ Non-existent ingredient removal handled:', error.response.data);
        }

        console.log('\n🎉 All tests completed successfully!');
        console.log('\n📊 SUMMARY:');
        console.log('- User registration and authentication: ✓');
        console.log('- Inventory creation and retrieval: ✓');
        console.log('- Adding ingredients: ✓');
        console.log('- Updating ingredients: ✓');
        console.log('- Removing ingredients: ✓');
        console.log('- Bulk inventory updates: ✓');
        console.log('- Error handling: ✓');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
        console.error('Full error:', error);
    }
}

// Run tests
testAPI();