'use client'

import { useState } from 'react';
import Image from 'next/image';
import { categories as initialCategories } from '@/lib/data';
import type { Category, Product } from '@/lib/types';
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
import { PlusCircle, Trash2, Upload, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminProductsPage() {
    const [categories, setCategories] = useState<Category[]>(initialCategories);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Product Management</h1>
                    <p className="text-muted-foreground">Add, edit, and manage your product categories and items.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </div>
            
            {categories.map(category => (
                <Card key={category.id} className="shadow-md">
                    <CardHeader className="flex flex-row justify-between items-start">
                        <div className="flex items-center gap-4">
                            <Image
                                src={category.image}
                                alt={category.name}
                                width={100}
                                height={60}
                                className="rounded-md object-cover"
                                data-ai-hint={category.imageHint}
                            />
                            <div>
                                <CardTitle className="text-xl">{category.name}</CardTitle>
                                <CardDescription>Pickup on: {category.pickupDays.join(', ')}</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                            </Button>
                             <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <h4 className="font-semibold text-md">Products in this Category</h4>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {category.products.map(product => (
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
                                    <CardFooter className="p-4">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Product
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                            <Button variant="outline" className="h-full border-dashed flex-col gap-2">
                                <PlusCircle className="h-6 w-6" />
                                <span>Add Product</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}