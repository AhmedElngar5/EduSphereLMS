import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Layers, PlusCircle } from 'lucide-react';
import { adminService } from '../services/adminService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';

export const CategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isCreating, setIsCreating] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminService.getCategories(),
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    );
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setIsCreating(true);
    try {
      await adminService.createCategory({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        displayOrder: Number(displayOrder),
      });
      setIsAddModalOpen(false);
      setName('');
      setSlug('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Categories</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize platform topic taxonomy and navigation grouping
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner size="md" message="Loading categories..." />
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">Order: {cat.displayOrder}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mt-3">{cat.name}</h3>
                <p className="font-mono text-[11px] text-indigo-600">/{cat.slug}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  {cat.courseCount} {cat.courseCount === 1 ? 'Course' : 'Courses'}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Active Tag
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="folder"
          title="No categories found"
          description="Click Add Category to create your first course subject category."
        />
      )}

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Course Category"
        maxWidth="md"
      >
        <form onSubmit={handleAddCategory} className="space-y-4">
          <Input
            label="Category Name"
            required
            value={name}
            onChange={handleNameChange}
            placeholder="e.g. Distributed Systems"
          />

          <Input
            label="Slug (URL friendly)"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="font-mono"
          />

          <Textarea
            label="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Topic domain description..."
          />

          <Input
            label="Display Order"
            type="number"
            min="1"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreating}
            >
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
