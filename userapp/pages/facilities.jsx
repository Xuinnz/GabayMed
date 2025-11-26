import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Calendar, X, ChevronRight, CreditCard, Building2, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { AppHeader } from '../components/app-header';

export function MyFacilities({ onOpenMessages, onOpenNotifications }) {
  const [selectedFacility, setSelectedFacility] = useState("pgh");
  const [showAllBalances, setShowAllBalances] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const facilities = [
    {
      id: "pgh",
      name: "Philippine General Hospital",
      insurancePlan: "Insurance Plan Used",
      lastVisit: "Oct 24",
    },
    {
      id: "uerm",
      name: "UERM Medical Center",
      insurancePlan: "HMO Coverage",
      lastVisit: "Sep 15",
    },
  ];

  const schedules = [
    {
      id: "1",
      date: "07",
      month: "Nov",
      status: "Scheduled",
      procedure: "General Check-up",
      doctor: "Dr. Jasper King Gueco",
      room: "Room 101",
    },
    {
      id: "2",
      date: "07",
      month: "Nov",
      status: "Done",
      procedure: "General Check-up",
      doctor: "Dr. Jasper King Gueco",
      room: "Room 101",
    },
  ];

  const activities = [
    { id: "1", type: "payment", description: "Service Availed", time: "10:32 AM", amount: -450 },
    { id: "2", type: "cashback", description: "Cashback?", time: "10:32 AM", amount: 150 },
  ];

  const balances = [
    { id: "1", procedure: "Laboratory Tests", amount: 2500, date: "Nov 5, 2024" },
    { id: "2", procedure: "X-Ray Imaging", amount: 1800, date: "Oct 28, 2024" },
    { id: "3", procedure: "Consultation Fee", amount: 800, date: "Oct 24, 2024" },
  ];

  const totalBalance = balances.reduce((sum, b) => sum + b.amount, 0);
  const currentFacility = facilities.find((f) => f.id === selectedFacility);

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
              <TouchableOpacity style={styles.scheduleButton}>
                <Calendar size={16} color="#fff" />
                <Text style={styles.scheduleButtonText}>Schedule New Appointment</Text>
              </TouchableOpacity>
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
                <TouchableOpacity>
                  <Text style={styles.seeAllButton}>See All</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scheduleScroll}>
                {schedules.map((schedule) => (
                  <View key={schedule.id} style={styles.scheduleCard}>
                    <View style={styles.scheduleMonth}>
                      <Calendar size={16} color="#0ea5e9" />
                      <Text style={styles.scheduleMonthText}>{schedule.month}</Text>
                    </View>
                    <Text style={styles.scheduleDate}>{schedule.date}</Text>
                    <View style={[
                      styles.statusBadge,
                      schedule.status === "Scheduled" ? styles.scheduledBadge : styles.doneBadge
                    ]}>
                      <Text style={[
                        styles.statusText,
                        schedule.status === "Scheduled" ? styles.scheduledText : styles.doneText
                      ]}>
                        {schedule.status}
                      </Text>
                    </View>
                    <View style={styles.scheduleDetails}>
                      <Text style={styles.scheduleProcedure}>{schedule.procedure}</Text>
                      <Text style={styles.scheduleDoctor}>{schedule.doctor}</Text>
                      <Text style={styles.scheduleRoom}>{schedule.room}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
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
                          <ArrowUpRight size={16} color="#ef4444" />
                        ) : (
                          <ArrowDownLeft size={16} color="#22c55e" />
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

              <TouchableOpacity
                onPress={() => {
                  setShowAllBalances(false);
                  setShowPaymentModal(true);
                }}
                style={styles.makePaymentButton}
              >
                <CreditCard size={16} color="#fff" />
                <Text style={styles.makePaymentButtonText}>Make Payment</Text>
              </TouchableOpacity>
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

              <TouchableOpacity style={styles.confirmPaymentButton}>
                <Text style={styles.confirmPaymentButtonText}>Confirm Payment</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    fontSize: 16,
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
    backgroundColor: '#f3f4f6',
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
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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
    color: '#6b7280',
    marginTop: 2,
  },
  scheduleScroll: {
    marginTop: 12,
  },
  scheduleCard: {
    width: 160,
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    marginRight: 12,
  },
  scheduleMonth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleMonthText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0ea5e9',
  },
  scheduleDate: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  scheduledBadge: {
    backgroundColor: '#dbeafe',
  },
  doneBadge: {
    backgroundColor: '#dcfce7',
  },
  statusText: {
    fontSize: 12,
  },
  scheduledText: {
    color: '#0284c7',
  },
  doneText: {
    color: '#16a34a',
  },
  scheduleDetails: {
    marginTop: 8,
  },
  scheduleProcedure: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0ea5e9',
  },
  scheduleDoctor: {
    fontSize: 12,
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
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIcon: {
    backgroundColor: '#fee2e2',
  },
  cashbackIcon: {
    backgroundColor: '#dcfce7',
  },
  activityDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  negativeAmount: {
    color: '#ef4444',
  },
  positiveAmount: {
    color: '#22c55e',
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
    backgroundColor: '#0ea5e9',
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
    backgroundColor: '#0ea5e9',
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
});
