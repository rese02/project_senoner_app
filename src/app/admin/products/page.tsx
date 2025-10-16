'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Category, Product, OrderOption } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';

export default function AdminProductsPage() {
    const firestore = useFirestore();
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingProduct, setEditingProduct] = useState<{product: Partial<Product>, categoryId: string} | null>(null);

    const categoriesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'categories'), orderBy('name'));
    }, [firestore]);

    const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesQuery);

    const handleSaveCategory = (categoryData: Partial<Category>) => {
        if (!firestore) return;
        if (categoryData.id) {
            const categoryRef = doc(firestore, 'categories', categoryData.id);
            setDocumentNonBlocking(categoryRef, categoryData, { merge: true });
        } else {
            const categoriesCollection = collection(firestore, 'categories');
            addDocumentNonBlocking(categoriesCollection, categoryData);
        }
        setEditingCategory(null);
    };

    const handleDeleteCategory = (categoryId: string) => {
        if (!firestore) return;
        const categoryRef = doc(firestore, 'categories', categoryId);
        deleteDocumentNonBlocking(categoryRef);
    };

    const handleSaveProduct = (productData: Partial<Product>, categoryId: string) => {
        if (!firestore || !categories) return;

        const targetCategory = categories.find(c => c.id === categoryId);
        if (!targetCategory) return;
        
        let updatedProducts: Partial<Product>[];

        if (productData.id) {
            updatedProducts = targetCategory.products.map(p => p.id === productData.id ? productData : p);
        } else {
            const newProduct = { ...productData, id: `prod-${Date.now()}` };
            updatedProducts = [...(targetCategory.products || []), newProduct];
        }
        
        const categoryRef = doc(firestore, 'categories', categoryId);
        setDocumentNonBlocking(categoryRef, { products: updatedProducts }, { merge: true });

        setEditingProduct(null);
    };

    const handleDeleteProduct = (productId: string, categoryId: string) => {
        if (!firestore || !categories) return;
        const targetCategory = categories.find(c => c.id === categoryId);
        if (!targetCategory) return;

        const updatedProducts = targetCategory.products.filter(p => p.id !== productId);
        const categoryRef = doc(firestore, 'categories', categoryId);
        setDocumentNonBlocking(categoryRef, { products: updatedProducts }, { merge: true });
    };

    if (categoriesLoading) return <p>Loading...</p>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Product Management</h1>
                    <p className="text-muted-foreground">Add, edit, and manage your product categories and items.</p>
                </div>
                <Dialog onOpenChange={(isOpen) => !isOpen && setEditingCategory(null)}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingCategory({id: '', name: '', image: '', imageHint: '', pickupDays: [], products: []})}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                  </DialogTrigger>
                  <CategoryFormDialog 
                    category={editingCategory}
                    onSave={handleSaveCategory}
                    onClose={() => setEditingCategory(null)}
                  />
                </Dialog>
            </div>
            
            {categories?.map(category => (
                <Card key={category.id} className="shadow-md">
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex items-center gap-4">
                             <div className="w-24 h-16 sm:w-28 sm:h-20 flex-shrink-0">
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    width={100}
                                    height={60}
                                    className="rounded-md object-cover w-full h-full"
                                    data-ai-hint={category.imageHint}
                                />
                             </div>
                            <div>
                                <CardTitle className="text-xl">{category.name}</CardTitle>
                                <CardDescription>Pickup on: {category.pickupDays.join(', ')}</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-center">
                             <Dialog onOpenChange={(isOpen) => !isOpen && setEditingCategory(null)}>
                                <DialogTrigger asChild>
                                     <Button variant="ghost" size="icon" onClick={() => setEditingCategory(category)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <CategoryFormDialog 
                                    category={editingCategory}
                                    onSave={handleSaveCategory}
                                    onClose={() => setEditingCategory(null)}
                                />
                             </Dialog>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the category and all its products.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                             </AlertDialog>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <h4 className="font-semibold text-md">Products in this Category</h4>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {category.products?.map(product => (
                                <Card key={product.id} className="flex flex-col">
                                    <CardHeader className="p-4">
                                         <div className="aspect-[4/3] rounded-md overflow-hidden mb-2">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                width={400}
                                                height={300}
                                                className="object-cover w-full h-full"
                                                data-ai-hint={product.imageHint}
                                            />
                                        </div>
                                        <CardTitle className="text-lg">{product.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 flex-grow">
                                        <Label className="text-xs">Order Options</Label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {product.orderOptions.map(option => (
                                                <Badge key={option.label} variant="secondary">{option.label} {option.description && `(${option.description})`}</Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 flex gap-2">
                                        <Dialog onOpenChange={(isOpen) => !isOpen && setEditingProduct(null)}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="w-full" onClick={() => setEditingProduct({product, categoryId: category.id})}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Button>
                                            </DialogTrigger>
                                            <ProductFormDialog
                                                product={editingProduct?.product}
                                                categoryId={category.id}
                                                onSave={handleSaveProduct}
                                                onClose={() => setEditingProduct(null)}
                                            />
                                        </Dialog>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" size="icon" className="text-destructive flex-shrink-0">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the product.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteProduct(product.id, category.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </CardFooter>
                                </Card>
                            ))}
                             <Dialog onOpenChange={(isOpen) => !isOpen && setEditingProduct(null)}>
                                <DialogTrigger asChild>
                                     <Button variant="outline" className="h-full border-dashed flex-col gap-2 min-h-[200px]" onClick={() => setEditingProduct({product: { name: '', image: '', imageHint: '', categoryId: category.id, orderOptions: []}, categoryId: category.id})}>
                                        <PlusCircle className="h-6 w-6" />
                                        <span>Add Product</span>
                                    </Button>
                                </DialogTrigger>
                                <ProductFormDialog
                                    product={editingProduct?.product}
                                    categoryId={category.id}
                                    onSave={handleSaveProduct}
                                    onClose={() => setEditingProduct(null)}
                                />
                             </Dialog>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function CategoryFormDialog({ category, onSave, onClose }: { category: Partial<Category> | null, onSave: (category: Partial<Category>) => void, onClose: () => void }) {
    const [name, setName] = useState('');
    const [pickupDays, setPickupDays] = useState<string[]>([]);
    const [image, setImage] = useState('');

    useEffect(() => {
        if (category) {
            setName(category.name || '');
            setPickupDays(category.pickupDays || []);
            setImage(category.image || `https://picsum.photos/seed/${Date.now()}/600/400`);
        }
    }, [category]);

    const handleSubmit = () => {
        if (name && category) {
            onSave({ ...category, name, pickupDays, image, imageHint: 'category image' });
            onClose();
        }
    };

    if (!category) return null;

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{category.id ? 'Edit' : 'Add'} Category</DialogTitle>
                <DialogDescription>
                    Fill in the details for the category.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input id="image" value={image} onChange={(e) => setImage(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Pickup Days</Label>
                    <div className="flex flex-wrap gap-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <Button
                                key={day}
                                variant={pickupDays.includes(day) ? 'secondary' : 'outline'}
                                onClick={() => {
                                    const newDays = pickupDays.includes(day)
                                        ? pickupDays.filter(d => d !== day)
                                        : [...pickupDays, day];
                                    setPickupDays(newDays);
                                }}
                            >
                                {day}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                </DialogClose>
                <Button type="submit" onClick={handleSubmit}>Save Category</Button>
            </DialogFooter>
        </DialogContent>
    );
}

function ProductFormDialog({ product, categoryId, onSave, onClose }: { product?: Partial<Product>, categoryId: string, onSave: (product: Partial<Product>, categoryId: string) => void, onClose: () => void }) {
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [options, setOptions] = useState<OrderOption[]>([]);
    
    useEffect(() => {
        if (product) {
            setName(product.name || '');
            setImage(product.image || `https://picsum.photos/seed/${Date.now()}/400/300`);
            setOptions(product.orderOptions || []);
        }
    }, [product]);

    const handleOptionChange = (index: number, field: keyof OrderOption, value: string) => {
        const newOptions = [...options];
        (newOptions[index] as any)[field] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, { type: 'portion', label: '', description: '' }]);
    };

    const removeOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (name && product) {
            onSave({ ...product, name, image, imageHint: 'product image', orderOptions: options }, categoryId);
            onClose();
        }
    };
    
    if (!product) return null;

    return (
        <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{product.id ? 'Edit' : 'Add'} Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input id="product-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="product-image">Image URL</Label>
                    <Input id="product-image" value={image} onChange={(e) => setImage(e.target.value)} />
                </div>
                <div className="space-y-4">
                    <Label>Order Options</Label>
                    {options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Input placeholder="Label (e.g., 0.5kg)" value={option.label} onChange={(e) => handleOptionChange(index, 'label', e.target.value)} />
                                <Input placeholder="Description (optional)" value={option.description || ''} onChange={(e) => handleOptionChange(index, 'description', e.target.value)} />
                            </div>
                            <Button variant="ghost" size="icon" className="text-destructive flex-shrink-0" onClick={() => removeOption(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addOption}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Option
                    </Button>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                </DialogClose>
                <Button type="submit" onClick={handleSubmit}>Save Product</Button>
            </DialogFooter>
        </DialogContent>
    );
}
