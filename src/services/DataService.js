import axios from 'axios';
import { mapApiDataToPesajes } from '../components/Helpers';

const CACHE_KEY = "spreadsheetData";
const CACHE_TIMESTAMP_KEY = "lastRefresh";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const dataService = {
  async fetchData(dataUrl) {
    try {
      const response = await axios.get(dataUrl);
      const allPesajes = mapApiDataToPesajes(response.data);
      this.updateCache(allPesajes);
      if (allPesajes?.length) {
        this.updateCache(allPesajes);
        return allPesajes;
      }
      return null;
    } catch (error) {
      console.error("Error fetching spreadsheet:", error);
      throw error;
    }
  },

  updateCache(data) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
  },

  getCachedData() {
    const data = localStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : null;
  },

  getLastUpdate (){
    const data = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    return data ?? "NA" 
  },

  isCacheValid() {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;
    
    const age = Date.now() - new Date(timestamp).getTime();
    return age < CACHE_EXPIRY;
  }
};