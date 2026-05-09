import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from 'antd';
import { useDebounce } from '../hooks/useDebounce';
import { useSearchStore } from '../stores/useSearchStore';

export default function SearchBar() {
  const { query, setQuery, search } = useSearchStore();
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      search(debouncedQuery);
      navigate('/search');
    }
  }, [debouncedQuery]);

  const onSearch = (value: string) => {
    if (value.trim()) {
      search(value);
      navigate('/search');
    }
  };

  return (
    <Input.Search
      placeholder="搜索组件名称或标签..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onSearch={onSearch}
      allowClear
      style={{ maxWidth: 360 }}
    />
  );
}
