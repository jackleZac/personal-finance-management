import EncryptedStorage from 'react-native-encrypted-storage';

// Store encrypted data
interface StorageData {
    [key: string]: any;
}

export async function storeData(key: string, value: StorageData): Promise<void> {
    try {
        await EncryptedStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Storage error:', error);
        throw error; // Re-throw so caller can handle
    }
}

// Retrieve encrypted data
export async function retrieveData<T>(key: string): Promise<T | null> {
    try {
        const value = await EncryptedStorage.getItem(key);
        return value ? JSON.parse(value) as T : null;
    } catch (error) {
        console.error('Retrieval error:', error);
        return null;
    }
}

// Remove encrypted data
export async function removeData(key: string): Promise<void> {
    try {
        await EncryptedStorage.removeItem(key);
    } catch (error) {
        console.error('Remove error:', error);
        throw error;
    }
}

// Clear all encrypted storage (use with caution!)
export async function clearAllData(): Promise<void> {
    try {
        await EncryptedStorage.clear();
    } catch (error) {
        console.error('Clear all error:', error);
        throw error;
    }
}