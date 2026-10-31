import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import leavesReducer from './leavesSlice';
import attendanceReducer from './attendanceSlice';
import announcementsReducer from './announcementsSlice';
import trainingsReducer from './trainingsSlice';
import notificationsReducer from './notificationsSlice';
import employeesReducer from './employeesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leaves: leavesReducer,
    attendance: attendanceReducer,
    announcements: announcementsReducer,
    trainings: trainingsReducer,
    notifications: notificationsReducer,
    employees: employeesReducer
  }
});

export default store;
