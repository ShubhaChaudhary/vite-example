import { selector } from 'recoil';
import api from '../../api';
import { Template } from '../../common/types/templates';
import { getAccessToken } from '../auth';

export const templatesState = selector<Template[]>({
  key: 'templatesState',
  get: async () => {
    const token = await getAccessToken();
    const { templates } = await api.templates.fetchTemplates(token);

    return templates;
  }
});