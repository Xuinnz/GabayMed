import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Calendar, X, ChevronRight, CreditCard, Building2, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { AppHeader } from '../components/app-header';
import { AppointmentBooking } from '../components/appointment';
import { GradientButton, GradientText, GradientIcon } from '../components/ui/gradient-button';
import { facilitiesData, schedulesData, activitiesData, balancesData } from '../data/facilitiesData';

export function MyFacilities({ onOpenMessages, onOpenNotifications }) {
  const [selectedFacility, setSelectedFacility] = useState("pgh");
  const [showAllBalances, setShowAllBalances] = useState(false);
  const [showAllSchedules, setShowAllSchedules] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAppointment, setShowAppointment] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activities, setActivities] = useState([]);
  const [balances, setBalances] = useState([]);

  // Reusable ScheduleCard component
  const ScheduleCard = ({ schedule, isSmall }) => {
    const statusStyles = {
      Scheduled: { badge: styles.scheduledBadge, text: styles.scheduledText },
      Done: { badge: styles.doneBadge, text: styles.doneText },
      Cancelled: { badge: styles.cancelledBadge, text: styles.cancelledText },
    };
    const { badge, text } = statusStyles[schedule.status] || statusStyles.Scheduled;

    return (
      <View style={isSmall ? styles.scheduleCardGrid : styles.scheduleCard}>
        <View style={styles.scheduleTopRow}>
          <GradientIcon style={[styles.scheduleCalendarIcon, isSmall && { width: 35, height: 35, marginTop: 12 }]}>
            <Calendar size={isSmall ? 18 : 24} color="#fff" />
          </GradientIcon>
          <View style={styles.scheduleDateContainer}>
            <GradientText style={[styles.scheduleMonthText, isSmall && { fontSize: 20, marginBottom: -4 }]}>
              {schedule.month}
            </GradientText>
            <GradientText style={[styles.scheduleDate, isSmall && { fontSize: 32, lineHeight: 36 }]}>
              {schedule.date}
            </GradientText>
          </View>
        </View>
        <View style={[styles.statusBadge, badge]}>
          <Text style={[styles.statusText, text]}>{schedule.status}</Text>
        </View>
        <View style={styles.scheduleDetails}>
          <GradientText style={[styles.scheduleProcedure, isSmall && { fontSize: 16 }]}>
            {schedule.procedure}
          </GradientText>
          <Text style={styles.scheduleDoctor}>{schedule.doctor}</Text>
          <Text style={styles.scheduleRoom}>{schedule.room}</Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    fetchFacilitiesData();
  }, []);

  const fetchFacilitiesData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // const facilitiesRes = await fetch('YOUR_API_ENDPOINT/facilities');
      // const schedulesRes = await fetch('YOUR_API_ENDPOINT/schedules');
      // const activitiesRes = await fetch('YOUR_API_ENDPOINT/activities');
      // const balancesRes = await fetch('YOUR_API_ENDPOINT/balances');
      
      // Simulated data
      setTimeout(() => {
        setFacilities(facilitiesData);
        setSchedules(schedulesData);
        setActivities(activitiesData);
        setBalances(balancesData);

        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching facilities data:', error);
      Alert.alert('Error', 'Failed to load facilities data');
      setLoading(false);
    }
  };

  const totalBalance = balances.reduce((sum, b) => sum + b.amount, 0);
  const currentFacility = facilities.find((f) => f.id === selectedFacility);

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader onOpenMessages={onOpenMessages} onOpenNotifications={onOpenNotifications} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Loading facilities...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader onOpenMessages={onOpenMessages} onOpenNotifications={onOpenNotifications} />

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Current Provider</Text>

          {/* Facility Card */}
          {currentFacility && (
            <View style={styles.facilityCard}>
              <TouchableOpacity
                onPress={() => setSelectedFacility(null)}
                style={styles.closeButton}
              >
                <X size={16} color="#6b7280" />
              </TouchableOpacity>
              <View style={styles.facilityHeader}>
                <View style={styles.facilityIcon}>
                  <Building2 size={24} color="#0ea5e9" />
                </View>
                <Text style={styles.facilityName}>{currentFacility.name}</Text>
              </View>
              <View style={styles.facilityInfo}>
                <View style={styles.insuranceBadge}>
                  <Text style={styles.insuranceText}>{currentFacility.insurancePlan}</Text>
                </View>
                <Text style={styles.lastVisitText}>Last Visit {currentFacility.lastVisit}</Text>
              </View>
              <GradientButton 
                onPress={() => setShowAppointment(true)}
                style={styles.scheduleButton}
              >
                <Calendar size={22} color="#66BAFF" fill="#fff" />
                <Text style={styles.scheduleButtonText}>Schedule New Appointment</Text>
              </GradientButton>
            </View>
          )}

          {/* Facility Selector if none selected */}
          {!selectedFacility && (
            <View style={styles.facilitySelectorContainer}>
              {facilities.map((facility) => (
                <TouchableOpacity
                  key={facility.id}
                  onPress={() => setSelectedFacility(facility.id)}
                  style={styles.facilitySelectorCard}
                >
                  <View style={styles.facilitySelectorContent}>
                    <View style={styles.facilityIcon}>
                      <Building2 size={24} color="#0ea5e9" />
                    </View>
                    <View style={styles.facilitySelectorInfo}>
                      <Text style={styles.facilitySelectorName}>{facility.name}</Text>
                      <Text style={styles.facilitySelectorLastVisit}>Last Visit: {facility.lastVisit}</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {selectedFacility && (
          <>
            {/* Your Schedule */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Schedule</Text>
                <TouchableOpacity onPress={() => setShowAllSchedules(!showAllSchedules)}>
                  <Text style={styles.seeAllButton}>{showAllSchedules ? 'Show Less' : 'See All'}</Text>
                </TouchableOpacity>
              </View>

              {showAllSchedules ? (
                <View style={styles.scheduleGrid}>
                  {schedules.map((schedule) => (
                    <ScheduleCard key={schedule.id} schedule={schedule} isSmall />
                  ))}
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scheduleScroll}>
                  {schedules.map((schedule) => (
                    <ScheduleCard key={schedule.id} schedule={schedule} />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Account Activity */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Account Activity</Text>
                <TouchableOpacity onPress={() => setShowAllBalances(true)}>
                  <Text style={styles.seeAllButton}>See All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.activityContainer}>
                {activities.map((activity) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={styles.activityLeft}>
                      <View style={[
                        styles.activityIcon,
                        activity.amount < 0 ? styles.paymentIcon : styles.cashbackIcon
                      ]}>
                        {activity.amount < 0 ? (
                          <ArrowUpRight size={20} color="#fff" />
                        ) : (
                          <ArrowDownLeft size={20} color="#fff" />
                        )}
                      </View>
                      <View>
                        <Text style={styles.activityDescription}>{activity.description}</Text>
                        <Text style={styles.activityTime}>{activity.time}</Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.activityAmount,
                      activity.amount < 0 ? styles.negativeAmount : styles.positiveAmount
                    ]}>
                      {activity.amount < 0 ? "-" : "+"}₱{Math.abs(activity.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* All Balances Modal */}
      <Modal
        visible={showAllBalances}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAllBalances(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Outstanding Balance</Text>
              <TouchableOpacity
                onPress={() => setShowAllBalances(false)}
                style={styles.modalCloseButton}
              >
                <X size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.totalBalanceCard}>
                <Text style={styles.totalBalanceLabel}>Total Pending Balance</Text>
                <Text style={styles.totalBalanceAmount}>₱{totalBalance.toLocaleString()}</Text>
              </View>

              <View style={styles.balancesList}>
                {balances.map((balance) => (
                  <View key={balance.id} style={styles.balanceItem}>
                    <View>
                      <Text style={styles.balanceProcedure}>{balance.procedure}</Text>
                      <Text style={styles.balanceDate}>{balance.date}</Text>
                    </View>
                    <Text style={styles.balanceAmount}>₱{balance.amount.toLocaleString()}</Text>
                  </View>
                ))}
              </View>

              <GradientButton
                onPress={() => {
                  setShowAllBalances(false);
                  setShowPaymentModal(true);
                }}
                style={styles.makePaymentButton}
              >
                <CreditCard size={16} color="#fff" />
                <Text style={styles.makePaymentButtonText}>Make Payment</Text>
              </GradientButton>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Make Payment</Text>
              <TouchableOpacity
                onPress={() => setShowPaymentModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount to Pay</Text>
                <TextInput
                  style={styles.input}
                  placeholder="₱0.00"
                  placeholderTextColor="#9ca3af"
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>For Procedure</Text>
                <View style={styles.selectContainer}>
                  {balances.map((balance) => (
                    <TouchableOpacity
                      key={balance.id}
                      onPress={() => setSelectedProcedure(balance.id)}
                      style={[
                        styles.selectOption,
                        selectedProcedure === balance.id && styles.selectOptionActive
                      ]}
                    >
                      <Text style={[
                        styles.selectOptionText,
                        selectedProcedure === balance.id && styles.selectOptionTextActive
                      ]}>
                        {balance.procedure} - ₱{balance.amount.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payment Method</Text>
                <View style={styles.paymentMethodGrid}>
                  {["Pay at Counter", "GCash", "Credit/Debit Card", "Online Banking"].map((method) => (
                    <TouchableOpacity key={method} style={styles.paymentMethodButton}>
                      <Text style={styles.paymentMethodText}>{method}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <GradientButton style={styles.confirmPaymentButton}>
                <Text style={styles.confirmPaymentButtonText}>Confirm Payment</Text>
              </GradientButton>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Appointment Booking Modal */}
      <AppointmentBooking
        visible={showAppointment}
        onClose={() => setShowAppointment(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAllButton: {
    color: '#0ea5e9',
    fontSize: 14,
    fontWeight: '500',
  },
  facilityCard: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  facilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  facilityIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facilityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  facilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  insuranceBadge: {
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  insuranceText: {
    fontSize: 14,
    color: '#6b7280',
  },
  lastVisitText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  facilitySelectorContainer: {
    marginTop: 12,
    gap: 8,
  },
  facilitySelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
  },
  facilitySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  facilitySelectorInfo: {
    flex: 1,
  },
  facilitySelectorName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  facilitySelectorLastVisit: {
    fontSize: 14,
    color: '#1f2937',
    marginTop: 2,
  },
  scheduleScroll: {
    marginTop: 12,
  },
  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  scheduleCard: {
    width: 180,
    height: 255,
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    marginRight: 12,
  },
  scheduleCardGrid: {
    width: '48%',
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
  },
  scheduleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scheduleCalendarIcon: {
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  scheduleDateContainer: {
    alignItems: 'flex-end',
  },
  scheduleMonthText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#66BAFF',
    marginBottom: -8,
  },
  scheduleDate: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#66BAFF',
    lineHeight: 52,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: -8,
  },
  scheduledBadge: {
    backgroundColor: '#66BAFF',
  },
  doneBadge: {
    backgroundColor: '#6FE2B2',
  },
  cancelledBadge: {
    backgroundColor: '#E26F6F',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scheduledText: {
    color: '#fff',
  },
  doneText: {
    color: '#fff',
  },
  cancelledText: {
    color: '#fff',
  },
  scheduleDetails: {
    marginTop: 16,
  },
  scheduleProcedure: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0ea5e9',
  },
  scheduleDoctor: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 4,
  },
  scheduleRoom: {
    fontSize: 12,
    color: '#9ca3af',
  },
  activityContainer: {
    marginTop: 12,
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIcon: {
    backgroundColor: '#E26F6F',
  },
  cashbackIcon: {
    backgroundColor: '#6FE2B2',
  },
  activityDescription: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A4D51',
  },
  activityTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  negativeAmount: {
    color: '#E26F6F',
  },
  positiveAmount: {
    color: '#6FE2B2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 16,
  },
  totalBalanceCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalBalanceLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  totalBalanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0284c7',
    marginTop: 4,
  },
  balancesList: {
    gap: 12,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  balanceProcedure: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  balanceDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  balanceAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  makePaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  makePaymentButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  selectContainer: {
    gap: 8,
  },
  selectOption: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  selectOptionActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#0ea5e9',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#4b5563',
  },
  selectOptionTextActive: {
    color: '#0284c7',
    fontWeight: '500',
  },
  paymentMethodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentMethodButton: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#374151',
  },
  confirmPaymentButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmPaymentButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});
