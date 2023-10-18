import api from './common/api';
import regionData from './common/api/regionData';

export default api({
  baseUrl: regionData.API_URL || '/v1'
});