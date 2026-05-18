import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export default function usePagedData(url, pageSize = 10) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const separator = url.includes('?') ? '&' : '?';
      const res = await api.get(`${url}${separator}page=${page}&size=${pageSize}`);
      const d = res.data;
      setData(d.content || []);
      setTotalPages(d.totalPages || 0);
      setTotalElements(d.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [url, page, pageSize]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refresh = () => fetchData();

  return { data, page, setPage, totalPages, totalElements, loading, error, refresh };
}
