import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type VehicleType = 'Car' | 'Bike' | 'Van';
type ScreenMode = 'list' | 'add' | 'edit';

type Vehicle = {
  id: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  registrationNumber: string;
  year: string;
};

type VehicleForm = Omit<Vehicle, 'id'>;

const PRIMARY = '#011C3A';
const SECONDARY = '#E4AF3F';
const BACKGROUND = '#F4F7FB';
const CARD = '#FFFFFF';
const MUTED = '#6C7A89';
const BORDER = '#D8E1EC';

const vehicleTypes: VehicleType[] = ['Car', 'Bike', 'Van'];

const emptyForm: VehicleForm = {
  vehicleType: 'Car',
  brand: '',
  model: '',
  registrationNumber: '',
  year: '',
};

export default function VehicleManagementScreen() {
  const [screenMode, setScreenMode] = useState<ScreenMode>('list');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    // Simulate a lightweight initial fetch so the screen has loading feedback.
    const timer = setTimeout(() => {
      setVehicles([
        {
          id: '1',
          vehicleType: 'Car',
          brand: 'Toyota',
          model: 'Corolla',
          registrationNumber: 'CAA-1234',
          year: '2020',
        },
        {
          id: '2',
          vehicleType: 'Bike',
          brand: 'Honda',
          model: 'CBR',
          registrationNumber: 'WPB-9087',
          year: '2022',
        },
      ]);
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!feedbackMessage) {
      return undefined;
    }

    const timer = setTimeout(() => setFeedbackMessage(''), 2200);
    return () => clearTimeout(timer);
  }, [feedbackMessage]);

  const updateField = (field: keyof VehicleForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const validateForm = () => {
    if (
      !form.brand.trim() ||
      !form.model.trim() ||
      !form.registrationNumber.trim() ||
      !form.year.trim()
    ) {
      Alert.alert('Missing details', 'Please fill in all vehicle fields before submitting.');
      return false;
    }

    if (!/^\d{4}$/.test(form.year.trim())) {
      Alert.alert('Invalid year', 'Please enter a valid 4-digit year.');
      return false;
    }

    return true;
  };

  const handleAddVehicle = () => {
    if (!validateForm()) {
      return;
    }

    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      vehicleType: form.vehicleType,
      brand: form.brand.trim(),
      model: form.model.trim(),
      registrationNumber: form.registrationNumber.trim().toUpperCase(),
      year: form.year.trim(),
    };

    setVehicles((current) => [newVehicle, ...current]);
    setFeedbackMessage('Vehicle added successfully.');
    resetForm();
    setScreenMode('list');
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setForm({
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model,
      registrationNumber: vehicle.registrationNumber,
      year: vehicle.year,
    });
    setEditingId(vehicle.id);
    setScreenMode('edit');
  };

  const handleUpdateVehicle = () => {
    if (!validateForm() || !editingId) {
      return;
    }

    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === editingId
          ? {
              ...vehicle,
              vehicleType: form.vehicleType,
              brand: form.brand.trim(),
              model: form.model.trim(),
              registrationNumber: form.registrationNumber.trim().toUpperCase(),
              year: form.year.trim(),
            }
          : vehicle
      )
    );

    setFeedbackMessage('Vehicle updated successfully.');
    resetForm();
    setScreenMode('list');
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    Alert.alert('Delete vehicle', 'Are you sure you want to remove this vehicle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          // Keep state local for now until a backend is connected.
          setVehicles((current) => current.filter((vehicle) => vehicle.id !== vehicleId));
          setFeedbackMessage('Vehicle deleted successfully.');
        },
      },
    ]);
  };

  const renderHeader = () => (
    <View style={styles.headerCard}>
      <View style={styles.headerTopRow}>
        <View>
          <Text style={styles.headerEyebrow}>Vehicle Service Booking App</Text>
          <Text style={styles.headerTitle}>Vehicle Management</Text>
          <Text style={styles.headerSubtitle}>
            Add, update, and manage all registered vehicles in one place.
          </Text>
        </View>
        <View style={styles.headerIconWrap}>
          <Ionicons name="car-sport" size={30} color={SECONDARY} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{vehicles.length}</Text>
          <Text style={styles.statLabel}>Total Vehicles</Text>
        </View>
        <Pressable style={styles.addButton} onPress={() => setScreenMode('add')}>
          <Ionicons name="add-circle" size={20} color={PRIMARY} />
          <Text style={styles.addButtonText}>Add Vehicle</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderVehicleCard = ({ item }: { item: Vehicle }) => (
    <View style={styles.vehicleCard}>
      <View style={styles.vehicleCardTop}>
        <View style={styles.vehicleIdentity}>
          <View style={styles.vehicleAvatar}>
            <Ionicons
              name={item.vehicleType === 'Bike' ? 'bicycle' : item.vehicleType === 'Van' ? 'bus' : 'car'}
              size={22}
              color={PRIMARY}
            />
          </View>
          <View>
            <Text style={styles.vehicleName}>
              {item.brand} {item.model}
            </Text>
            <Text style={styles.vehicleReg}>{item.registrationNumber}</Text>
          </View>
        </View>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.vehicleType}</Text>
        </View>
      </View>

      <View style={styles.vehicleMetaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={16} color={SECONDARY} />
          <Text style={styles.metaText}>{item.year}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="pricetag-outline" size={16} color={SECONDARY} />
          <Text style={styles.metaText}>Registered</Text>
        </View>
      </View>

      <View style={styles.cardActionRow}>
        <Pressable style={styles.secondaryButton} onPress={() => handleEditVehicle(item)}>
          <Ionicons name="create-outline" size={18} color={PRIMARY} />
          <Text style={styles.secondaryButtonText}>Edit</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={() => handleDeleteVehicle(item.id)}>
          <Ionicons name="trash-outline" size={18} color="#B42318" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderVehicleListScreen = () => (
    <View style={styles.contentArea}>
      {feedbackMessage ? (
        <View style={styles.feedbackBanner}>
          <Ionicons name="checkmark-circle" size={18} color={PRIMARY} />
          <Text style={styles.feedbackText}>{feedbackMessage}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.stateCard}>
          <Ionicons name="sync-outline" size={32} color={PRIMARY} />
          <Text style={styles.stateTitle}>Loading vehicles...</Text>
          <Text style={styles.stateSubtitle}>Please wait while we prepare your garage.</Text>
        </View>
      ) : vehicles.length === 0 ? (
        <View style={styles.stateCard}>
          <Ionicons name="car-outline" size={36} color={PRIMARY} />
          <Text style={styles.stateTitle}>No vehicles added yet</Text>
          <Text style={styles.stateSubtitle}>
            Start by adding your first car, bike, or van to the app.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => setScreenMode('add')}>
            <Text style={styles.primaryButtonText}>Add Your First Vehicle</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          renderItem={renderVehicleCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  const renderTypeSelector = () => (
    <View style={styles.typeSelectorRow}>
      {vehicleTypes.map((type) => {
        const selected = form.vehicleType === type;
        return (
          <Pressable
            key={type}
            style={[styles.typeOption, selected && styles.typeOptionSelected]}
            onPress={() => updateField('vehicleType', type)}>
            <Text style={[styles.typeOptionText, selected && styles.typeOptionTextSelected]}>{type}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderFormScreen = () => {
    const isEdit = screenMode === 'edit';

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.contentArea}>
        <ScrollView contentContainerStyle={styles.formScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            <View style={styles.formHeaderRow}>
              <Pressable
                style={styles.backButton}
                onPress={() => {
                  resetForm();
                  setScreenMode('list');
                }}>
                <Ionicons name="arrow-back" size={18} color={PRIMARY} />
              </Pressable>
              <View>
                <Text style={styles.formTitle}>{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</Text>
                <Text style={styles.formSubtitle}>
                  {isEdit
                    ? 'Update the vehicle information below.'
                    : 'Enter the vehicle details to save it locally.'}
                </Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>Vehicle Type</Text>
            {renderTypeSelector()}

            <Text style={styles.inputLabel}>Brand</Text>
            <TextInput
              value={form.brand}
              onChangeText={(value) => updateField('brand', value)}
              placeholder="Enter brand"
              placeholderTextColor="#93A1B2"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Model</Text>
            <TextInput
              value={form.model}
              onChangeText={(value) => updateField('model', value)}
              placeholder="Enter model"
              placeholderTextColor="#93A1B2"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Registration Number</Text>
            <TextInput
              value={form.registrationNumber}
              onChangeText={(value) => updateField('registrationNumber', value)}
              placeholder="Enter registration number"
              autoCapitalize="characters"
              placeholderTextColor="#93A1B2"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Year</Text>
            <TextInput
              value={form.year}
              onChangeText={(value) => updateField('year', value.replace(/[^0-9]/g, ''))}
              placeholder="Enter year"
              keyboardType="number-pad"
              placeholderTextColor="#93A1B2"
              style={styles.input}
              maxLength={4}
            />

            <Pressable style={styles.primaryButton} onPress={isEdit ? handleUpdateVehicle : handleAddVehicle}>
              <Ionicons name={isEdit ? 'save-outline' : 'add-outline'} size={18} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>{isEdit ? 'Update Vehicle' : 'Save Vehicle'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
      <View style={styles.container}>
        {renderHeader()}
        {/* Simple internal screen switching keeps the module self-contained in one file. */}
        {screenMode === 'list' ? renderVehicleListScreen() : renderFormScreen()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PRIMARY,
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  headerCard: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerEyebrow: {
    color: '#C4D0DE',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#DBE5F0',
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 260,
  },
  headerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(228, 175, 63, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  statNumber: {
    color: SECONDARY,
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: '#DDE7F2',
    fontSize: 13,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: SECONDARY,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  addButtonText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '700',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF5D9',
    borderColor: '#F1D48B',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  feedbackText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 28,
    gap: 14,
  },
  vehicleCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E7EDF5',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  vehicleCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  vehicleIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  vehicleAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EEF4FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleName: {
    fontSize: 17,
    fontWeight: '700',
    color: PRIMARY,
  },
  vehicleReg: {
    fontSize: 13,
    color: MUTED,
    marginTop: 4,
  },
  typeBadge: {
    backgroundColor: '#FFF5D9',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  typeBadgeText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: '700',
  },
  vehicleMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '500',
  },
  cardActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EEF4FB',
    borderRadius: 16,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF1F1',
    borderRadius: 16,
    paddingVertical: 12,
  },
  deleteButtonText: {
    color: '#B42318',
    fontSize: 14,
    fontWeight: '700',
  },
  stateCard: {
    backgroundColor: CARD,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: '#E7EDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  stateTitle: {
    color: PRIMARY,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 14,
  },
  stateSubtitle: {
    color: MUTED,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },
  formScrollContent: {
    paddingBottom: 28,
  },
  formCard: {
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E7EDF5',
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 18,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#EEF4FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  formTitle: {
    color: PRIMARY,
    fontSize: 22,
    fontWeight: '700',
  },
  formSubtitle: {
    color: MUTED,
    fontSize: 14,
    marginTop: 6,
  },
  inputLabel: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 14,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    flex: 1,
    backgroundColor: '#F6F8FB',
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  typeOptionSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  typeOptionText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '700',
  },
  typeOptionTextSelected: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FBFCFE',
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: PRIMARY,
    fontSize: 15,
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: PRIMARY,
    borderRadius: 18,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
