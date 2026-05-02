import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function InfoModal({ visible, onClose, title, content }: InfoModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, { backgroundColor: secondaryBackgroundColor }]}>
              {/* Handle bar */}
              <View style={styles.handleBar} />
              
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={[styles.closeButtonText, { color: iconColor }]}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView 
                style={styles.contentContainer}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.contentText, { color: textColor }]}>
                  {content}
                </Text>
              </ScrollView>

              {/* Close button at bottom */}
              <TouchableOpacity 
                style={[styles.bottomButton, { backgroundColor: '#007AFF' }]}
                onPress={onClose}
              >
                <Text style={styles.bottomButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '300',
  },
  contentContainer: {
    marginBottom: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  bottomButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  bottomButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});