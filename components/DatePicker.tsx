import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { months } from '@/utils/dateUtils';

// Utility arrays for days, months, and years
const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const years = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());

interface DatePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (day: string, month: string, year: string) => void;
  initialDay: string;
  initialMonth: string;
  initialYear: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  isVisible,
  onClose,
  onConfirm,
  initialDay,
  initialMonth,
  initialYear,
}) => {
  const [tempDay, setTempDay] = React.useState(initialDay);
  const [tempMonth, setTempMonth] = React.useState(initialMonth);
  const [tempYear, setTempYear] = React.useState(initialYear);

  const handleConfirm = () => {
    onConfirm(tempDay, tempMonth, tempYear);
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onBackdropPress={onClose}
      style={styles.modal}
    >
      <View style={styles.dateModalContainer}>
        <View style={styles.dateModalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalHeaderText}>Select Date</Text>
          <TouchableOpacity onPress={handleConfirm}>
            <Text style={styles.modalButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.datePickerContainer}>
          {/* Day Picker */}
          <ScrollView
            style={styles.picker}
            showsVerticalScrollIndicator={false}
            snapToInterval={40}
            decelerationRate="fast"
          >
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.pickerItem, day === tempDay && styles.pickerItemSelected]}
                onPress={() => setTempDay(day)}
              >
                <Text style={styles.pickerItemText}>{day}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Month Picker */}
          <ScrollView
            style={styles.picker}
            showsVerticalScrollIndicator={false}
            snapToInterval={40}
            decelerationRate="fast"
          >
            {months.map((month, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.pickerItem, month === tempMonth && styles.pickerItemSelected]}
                onPress={() => setTempMonth(month)}
              >
                <Text style={styles.pickerItemText}>{month}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Year Picker */}
          <ScrollView
            style={styles.picker}
            showsVerticalScrollIndicator={false}
            snapToInterval={40}
            decelerationRate="fast"
          >
            {years.map((year, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.pickerItem, year === tempYear && styles.pickerItemSelected]}
                onPress={() => setTempYear(year)}
              >
                <Text style={styles.pickerItemText}>{year}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  dateModalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '40%',
  },
  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalButtonText: {
    color: 'blue',
    fontSize: 16,
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  datePickerContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  picker: {
    flex: 1,
    marginHorizontal: 10,
  },
  pickerItem: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#e0e0e0',
  },
  pickerItemText: {
    fontSize: 16,
  },
});

export default DatePicker;