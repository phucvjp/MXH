
import { Group } from '@/service/GroupService';
import { createSlice } from '@reduxjs/toolkit';

interface GroupsState {
  loading: boolean;
  value: Group[];
  currentGroup?: Group;
  currentPageList: Group[];
  currentPageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  filter?: string;
  error: string;
}

// Define the initial state using that type
const initialState: GroupsState = {
  loading: true,
  value: [],
  currentGroup: undefined,
  currentPageList: [],
  currentPageNumber: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
  error: '',
};

export const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    setGroups: (state, action) => {
      state.value = action.payload;
      state.totalItems = action.payload.length;
    },
    setCurrentGroup: (state, action) => {
      state.currentGroup = action.payload;
    },
    setCurrentPageNumber: (state, action) => {
      state.currentPageNumber = action.payload.pageNumber;
      state.totalPages = action.payload.totalPages;
    },
    setCurrentPageList: (state, action) => {
      state.currentPageList = action.payload;
    },
    error: () => {},
  },
});

export const { setGroups, setCurrentGroup, setCurrentPageList, setCurrentPageNumber, error } =
  groupsSlice.actions;
export default groupsSlice.reducer;
