import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { apiCoreDownload } from './apiService';

export async function downloadMonthlyReport(userId: string, token: string) {
  try {
    const response = await apiCoreDownload('/report', 'POST', token, { user_id: userId });
    const blob = await response.blob();

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const fileUri = FileSystem.documentDirectory + 'monthly_report.pdf';
      
      // Fix: Use the string 'base64' directly instead of EncodingType.Base64
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: 'base64',  // Changed from FileSystem.EncodingType.Base64
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        alert('Sharing is not available on this device');
      }
    };
    reader.readAsDataURL(blob);
  } catch (err: any) {
    console.error('Report download failed:', err.message);
    alert(err.message || 'Something went wrong');
  }
}