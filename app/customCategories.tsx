import React, { useState, useEffect, use } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '@/components/Header';
import { fetchCategories} from '@/api/categoryApi';
import { Category } from '@/types/types';
import { useAuth } from '@/hooks/AuthContext';
import Modal from 'react-native-modal';
import CreateCategory from '@/components/CreateCategory';
import WebSocketService from '@/api/webSocketService';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function CustomCategories() {
  const router = useRouter();
  const { token, userId } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateCategoryModalVisible, setIsCreateCategoryModalVisible] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');

  useEffect(() => {
    const loadCategories = async () => {
      if (!token || !userId) {
        setError('Authentication details missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetchCategories(token);
        // Filter for custom categories (is_default: false)
        const customCategories = response.categories?.filter(
          (category) => !category.is_default
        );
        setCategories(customCategories || []);
      } catch (error: any) {
        console.error('Error fetching categories:', error.message);
        setError('An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [token, userId]);

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    if (userId && token) {
      // Initialize WebSocket with token
      WebSocketService.initialize(token);
      // Listen for category updates from backend
      WebSocketService.on('categories_update', (data) => {
        console.log('Received categories update:', data);
        // Refetch categories to update the list
        fetchCategories(token).then((response) => {
          const customCategories = response.categories?.filter(
            (category) => !category.is_default
          );
          setCategories(customCategories || []);
        });
      })};

      // Cleanup on unmount
      return () => {
        WebSocketService.on('categories_update', () => {});
      }
  }, [userId, token]);

  const navigateToEditCategory = (category: Category) => {
    router.push({
      pathname: '/updateCategory',
      params: {
        category_id: String(category.category_id),
        name: category.name,
        icon_id: category.icon_id,
        type: category.type,
      },
    });
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: secondaryBackgroundColor }]}
      onPress={() => navigateToEditCategory(item)}
    >
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: textColor }]}>{item.name}</Text>
        <Text style={[styles.itemValue, { color: iconColor }]}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Text>
      </View>
      <Icon name="chevron-right" size={20} color={iconColor} style={{ alignSelf: 'center' }} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#0047AB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Header title="Custom Categories" variant="back" />
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: textColor }]}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.container, { backgroundColor }]}>
        <Header title="Custom Categories" variant="back" onCreatePress={() => setIsCreateCategoryModalVisible(true)}/>
        <ScrollView style={[styles.content, { backgroundColor }]}>
          {categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: textColor }]}>No custom categories found.</Text>
            </View>
          ) : (
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.category_id.toString()}
              scrollEnabled={false}
              nestedScrollEnabled={true}
              contentContainerStyle={styles.listContent}
            />
          )}
        </ScrollView>
      </View>

      {/* Create Category Modal */}
      <Modal
        isVisible={isCreateCategoryModalVisible}
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        onBackdropPress={() => setIsCreateCategoryModalVisible(false)}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <CreateCategory
          onClose={() => setIsCreateCategoryModalVisible(false)}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemValue: {
    fontSize: 14,
    marginTop: 2,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});