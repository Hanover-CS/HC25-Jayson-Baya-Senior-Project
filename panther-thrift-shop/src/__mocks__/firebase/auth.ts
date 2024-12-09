export const getAuth = jest.fn(() => ({
    currentUser: null,
}));

export const onAuthStateChanged = jest.fn((auth, callback) => {
    callback(null); // Simulate unauthenticated user
    return jest.fn(); // Mock unsubscribe function
});
