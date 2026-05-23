import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, BookOpen, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { skillsApi } from '../services/api';
import { Skill, Category, Pagination } from '../types';

const inputCls = 'w-full h-9 px-3 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors';
const selectCls = 'w-full h-9 px-3 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 focus:outline-none focus:border-edge-2 transition-colors';
const textareaCls = 'w-full px-3 py-2.5 bg-canvas border border-edge rounded-lg text-[13px] text-fg-1 placeholder:text-fg-3 focus:outline-none focus:border-edge-2 transition-colors resize-none';
const labelCls = 'block text-[12px] font-medium text-fg-2 mb-1.5';
const tabCls = (active: boolean) =>
  `px-5 py-3.5 text-[13px] font-medium transition-colors whitespace-nowrap ${
    active ? 'text-accent border-b-2 border-accent' : 'text-fg-3 hover:text-fg-1'
  }`;

const Skills: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'skills' | 'categories'>('skills');
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [modal, setModal] = useState<{ type: 'skill' | 'category'; mode: 'create' | 'edit'; data?: any } | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', category: '', icon: '' });

  useEffect(() => { fetchData(); }, [activeTab, pagination.page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'skills') {
        const [skillsRes, catsRes] = await Promise.all([
          skillsApi.getSkills({ page: pagination.page, limit: pagination.limit }),
          skillsApi.getCategories(),
        ]);
        setSkills(skillsRes.data.data || []);
        setPagination(skillsRes.data.pagination);
        setCategories(catsRes.data.data || []);
      } else {
        const catsRes = await skillsApi.getCategories();
        setCategories(catsRes.data.data || []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) { toast.error('Name is required'); return; }
    try {
      if (modal?.type === 'skill') {
        if (modal.mode === 'create') await skillsApi.createSkill(formData);
        else await skillsApi.updateSkill(modal.data._id, formData);
      } else {
        if (modal?.mode === 'create') await skillsApi.createCategory(formData);
        else await skillsApi.updateCategory(modal?.data._id, formData);
      }
      toast.success(`${modal?.type === 'skill' ? 'Skill' : 'Category'} ${modal?.mode === 'create' ? 'created' : 'updated'}`);
      fetchData();
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id: string, type: 'skill' | 'category') => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      if (type === 'skill') await skillsApi.deleteSkill(id);
      else await skillsApi.deleteCategory(id);
      toast.success(`${type === 'skill' ? 'Skill' : 'Category'} deleted`);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const openCreateModal = (type: 'skill' | 'category') => {
    setFormData({ name: '', description: '', category: '', icon: '' });
    setModal({ type, mode: 'create' });
  };

  const openEditModal = (type: 'skill' | 'category', data: any) => {
    setFormData({ name: data.name || '', description: data.description || '', category: data.category?._id || data.category || '', icon: data.icon || '' });
    setModal({ type, mode: 'edit', data });
  };

  const closeModal = () => {
    setModal(null);
    setFormData({ name: '', description: '', category: '', icon: '' });
  };

  const skillColumns = [
    {
      key: 'name',
      header: 'Skill',
      className: 'w-[38%]',
      render: (skill: Skill) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-note-bg rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-note" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-fg-1 truncate">{skill.name}</p>
            <p className="text-[11px] text-fg-3 truncate">{skill.description?.slice(0, 50)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      className: 'w-[20%]',
      render: (skill: Skill) => (
        <Badge variant="info">{typeof skill.category === 'object' ? skill.category.name : skill.category}</Badge>
      ),
    },
    {
      key: 'teacherCount',
      header: 'Teachers',
      className: 'w-[12%]',
      render: (skill: Skill) => <span className="text-[13px] font-medium text-fg-1">{skill.teacherCount || 0}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-[15%]',
      render: (skill: Skill) => <Badge variant={skill.isActive ? 'success' : 'warning'}>{skill.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[15%]',
      render: (skill: Skill) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={Edit} onClick={(e) => { e.stopPropagation(); openEditModal('skill', skill); }} />
          <Button variant="ghost" size="sm" icon={Trash2} onClick={(e) => { e.stopPropagation(); handleDelete(skill._id, 'skill'); }} />
        </div>
      ),
    },
  ];

  const categoryColumns = [
    {
      key: 'name',
      header: 'Category',
      className: 'w-[42%]',
      render: (cat: Category) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-dim rounded-lg flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-fg-1 truncate">{cat.name}</p>
            <p className="text-[11px] text-fg-3 truncate">{cat.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'skillCount',
      header: 'Skills',
      className: 'w-[15%]',
      render: (cat: Category) => <span className="text-[13px] font-medium text-fg-1">{cat.skillCount || 0}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-[20%]',
      render: (cat: Category) => <Badge variant={cat.isActive ? 'success' : 'warning'}>{cat.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[23%]',
      render: (cat: Category) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={Edit} onClick={(e) => { e.stopPropagation(); openEditModal('category', cat); }} />
          <Button variant="ghost" size="sm" icon={Trash2} onClick={(e) => { e.stopPropagation(); handleDelete(cat._id, 'category'); }} />
        </div>
      ),
    },
  ];

  return (
    <div className="p-5 space-y-4">
      <div className="bg-panel border border-edge rounded-xl overflow-hidden">
        <div className="border-b border-edge flex justify-between items-center">
          <div className="flex">
            <button onClick={() => setActiveTab('skills')} className={tabCls(activeTab === 'skills')}>Skills</button>
            <button onClick={() => setActiveTab('categories')} className={tabCls(activeTab === 'categories')}>Categories</button>
          </div>
          <div className="pr-4">
            <Button icon={Plus} onClick={() => openCreateModal(activeTab === 'skills' ? 'skill' : 'category')}>
              Add {activeTab === 'skills' ? 'Skill' : 'Category'}
            </Button>
          </div>
        </div>

        {activeTab === 'skills' ? (
          <DataTable columns={skillColumns} data={skills} loading={loading} pagination={{ ...pagination, onPageChange: (page) => setPagination((prev) => ({ ...prev, page })) }} />
        ) : (
          <DataTable columns={categoryColumns} data={categories} loading={loading} />
        )}
      </div>

      <Modal isOpen={!!modal} onClose={closeModal} title={`${modal?.mode === 'create' ? 'Create' : 'Edit'} ${modal?.type === 'skill' ? 'Skill' : 'Category'}`}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className={textareaCls} />
          </div>
          {modal?.type === 'skill' && (
            <div>
              <label className={labelCls}>Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={selectCls}>
                <option value="">Select Category</option>
                {categories.map((cat) => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit}>{modal?.mode === 'create' ? 'Create' : 'Save'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Skills;
