'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Package, Plus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface InventoryViewProps {
  inventory: any[]
  partRequests: any[]
}

export function InventoryView({ inventory, partRequests }: InventoryViewProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Form state
  const [partName, setPartName] = useState('')
  const [partNumber, setPartNumber] = useState('')
  const [category, setCategory] = useState('')
  const [quantity, setQuantity] = useState('')
  const [minQuantity, setMinQuantity] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [location, setLocation] = useState('')
  const [filterCategory, setFilterCategory] = useState<'all' | 'printers' | 'scanners' | 'shared'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'unit_cost'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const router = useRouter()

  const handleAddItem = async () => {
    if (!partName || !quantity) return
    setLoading(true)
    setErrorMessage(null)

    const response = await fetch('/api/inventory/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: partName,
        description: partNumber || null,
        category: category || 'other',
        quantity: parseInt(quantity),
        min_quantity: parseInt(minQuantity) || 5,
        unit_price: unitCost ? parseFloat(unitCost) : null,
        location: location || null,
      }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      setLoading(false)
      setErrorMessage(payload?.error || 'Failed to add item')
      return
    }

    setLoading(false)
    setAddDialogOpen(false)
    resetForm()
    router.refresh()
  }

  const handleUpdateItem = async () => {
    if (!selectedItem) return
    setLoading(true)
    setErrorMessage(null)

    const response = await fetch(`/api/inventory/items/${selectedItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: partName,
        description: partNumber || null,
        category: category,
        quantity: parseInt(quantity),
        min_quantity: parseInt(minQuantity),
        unit_price: unitCost ? parseFloat(unitCost) : null,
        location: location || null,
      }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      setLoading(false)
      setErrorMessage(payload?.error || 'Failed to update item')
      return
    }

    setLoading(false)
    setEditDialogOpen(false)
    resetForm()
    router.refresh()
  }

  const handleApproveRequest = async (requestId: string, itemId: string, qty: number) => {
    setLoading(true)
    setErrorMessage(null)

    const response = await fetch(`/api/inventory/requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'approve',
        inventory_item_id: itemId,
        quantity_requested: qty,
      }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      setLoading(false)
      setErrorMessage(payload?.error || 'Failed to approve request')
      return
    }

    setLoading(false)
    router.refresh()
  }

  const handleRejectRequest = async (requestId: string) => {
    setLoading(true)
    setErrorMessage(null)

    const response = await fetch(`/api/inventory/requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deny' }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      setLoading(false)
      setErrorMessage(payload?.error || 'Failed to reject request')
      return
    }

    setLoading(false)
    router.refresh()
  }

  const resetForm = () => {
    setPartName('')
    setPartNumber('')
    setCategory('')
    setQuantity('')
    setMinQuantity('')
    setUnitCost('')
    setLocation('')
    setSelectedItem(null)
  }

  const openEditDialog = (item: any) => {
    setSelectedItem(item)
    setPartName(item.name)
    setPartNumber(item.description || '')
    setCategory(item.category)
    setQuantity(item.quantity.toString())
    setMinQuantity(item.min_quantity.toString())
    setUnitCost((item.unit_price ?? item.unit_cost)?.toString() || '')
    setLocation(item.location || '')
    setEditDialogOpen(true)
  }

  const lowStockItems = inventory.filter(item => item.quantity <= item.min_quantity)
  const displayPartName = (item: any) => item.name || 'Unnamed item'
  const displayDescription = (item: any) => item.description || '-'
  const displayUnitCost = (item: any) => item.unit_price

  const normalizedCategory = (item: any) =>
    String(item?.category || '')
      .trim()
      .toLowerCase()

  const matchesCategory = (item: any) => {
    const categoryValue = normalizedCategory(item)
    if (filterCategory === 'all') return true
    if (filterCategory === 'printers') {
      return categoryValue.includes('printer')
    }
    if (filterCategory === 'scanners') {
      return categoryValue.includes('scanner')
    }
    return (
      categoryValue.includes('shared') ||
      categoryValue.includes('universal')
    )
  }

  const getUnitCostValue = (item: any) =>
    Number(item.unit_price ?? item.unit_cost ?? 0)

  const filteredSortedInventory = useMemo(() => {
    const filtered = inventory.filter(matchesCategory)

    const sorted = [...filtered].sort((a, b) => {
      let compareValue = 0

      if (sortBy === 'name') {
        compareValue = displayPartName(a).localeCompare(displayPartName(b))
      } else if (sortBy === 'quantity') {
        compareValue = Number(a.quantity || 0) - Number(b.quantity || 0)
      } else {
        compareValue = getUnitCostValue(a) - getUnitCostValue(b)
      }

      return sortOrder === 'asc' ? compareValue : -compareValue
    })

    return sorted
  }, [inventory, filterCategory, sortBy, sortOrder])

  const resetFilters = () => {
    setFilterCategory('all')
    setSortBy('name')
    setSortOrder('asc')
  }

  return (
    <>
      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory ({inventory.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Part Requests ({partRequests.length})
          </TabsTrigger>
          <TabsTrigger value="low-stock" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Low Stock ({lowStockItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Inventory Items</CardTitle>
                <CardDescription>
                  All parts and supplies in stock (showing {filteredSortedInventory.length} of {inventory.length})
                </CardDescription>
              </div>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              {errorMessage && (
                <p className="text-sm text-destructive mb-4">{errorMessage}</p>
              )}
              <div className="mb-4 rounded-xl border border-border/70 bg-muted/20 p-4">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="min-w-[180px] flex-1">
                    <FieldLabel>Filter by Category</FieldLabel>
                    <Select value={filterCategory} onValueChange={(value: 'all' | 'printers' | 'scanners' | 'shared') => setFilterCategory(value)}>
                      <SelectTrigger className="mt-1 rounded-lg bg-background/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="printers">Printers</SelectItem>
                        <SelectItem value="scanners">Scanners</SelectItem>
                        <SelectItem value="shared">Shared / Universal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-[160px] flex-1">
                    <FieldLabel>Sort By</FieldLabel>
                    <Select value={sortBy} onValueChange={(value: 'name' | 'quantity' | 'unit_cost') => setSortBy(value)}>
                      <SelectTrigger className="mt-1 rounded-lg bg-background/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="quantity">Quantity</SelectItem>
                        <SelectItem value="unit_cost">Unit Cost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-[190px] flex-1">
                    <FieldLabel>Order</FieldLabel>
                    <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                      <SelectTrigger className="mt-1 rounded-lg bg-background/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending (A→Z, 0→9)</SelectItem>
                        <SelectItem value="desc">Descending (Z→A, 9→0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-[140px]">
                    <Button variant="outline" className="w-full rounded-lg" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Min Qty</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSortedInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{displayPartName(item)}</TableCell>
                      <TableCell>{displayDescription(item)}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <span className={item.quantity <= item.min_quantity ? 'text-destructive font-medium' : ''}>
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{item.min_quantity}</TableCell>
                      <TableCell>{displayUnitCost(item) ? `$${displayUnitCost(item).toFixed(2)}` : '-'}</TableCell>
                      <TableCell>{item.location || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSortedInventory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        No inventory items match the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Part Requests</CardTitle>
              <CardDescription>Requests from technicians for parts</CardDescription>
            </CardHeader>
            <CardContent>
              {partRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.inventory_items?.name}</p>
                            <p className="text-sm text-muted-foreground">{request.inventory_items?.description || '-'}</p>
                          </div>
                        </TableCell>
                        <TableCell>{request.quantity_requested}</TableCell>
                        <TableCell>{request.profiles?.full_name}</TableCell>
                        <TableCell>
                          <div>
                            <p>{request.tasks?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {request.tasks?.devices?.brand} {request.tasks?.devices?.model}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{request.notes || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600"
                              onClick={() => handleApproveRequest(request.id, request.inventory_item_id, request.quantity_requested)}
                              disabled={loading}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={loading}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No pending part requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Low Stock Items
              </CardTitle>
              <CardDescription>Items at or below minimum quantity</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockItems.length > 0 ? (
                <div className="space-y-4">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-[#f59e0b] p-4 [background:linear-gradient(rgba(245,158,11,0.10),rgba(245,158,11,0.10)),#111827] transition-all duration-200 hover:border-[#fbbf24] hover:[box-shadow:0_0_0_1px_rgba(245,158,11,0.45),0_12px_32px_rgba(245,158,11,0.12)]"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-white">{displayPartName(item)}</p>
                        <p className="text-sm text-[#9ca3af]">{displayDescription(item)}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-medium text-[#ef4444]">{item.quantity} in stock</p>
                        <p className="text-sm text-[#9ca3af]">Minimum: {item.min_quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-green-600">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                  <p>All items are adequately stocked</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Add a new part or supply to inventory</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Part Name *</FieldLabel>
              <Input value={partName} onChange={(e) => setPartName(e.target.value)} placeholder="e.g., Toner Cartridge Black" />
            </Field>
            <Field>
              <FieldLabel>Description / Notes</FieldLabel>
              <Input value={partNumber} onChange={(e) => setPartNumber(e.target.value)} placeholder="e.g., TN-450 or item notes" />
            </Field>
            <Field>
              <FieldLabel>Category</FieldLabel>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Toner" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Quantity *</FieldLabel>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>Min Quantity</FieldLabel>
                <Input type="number" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} placeholder="5" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Unit Cost ($)</FieldLabel>
                <Input type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>Location</FieldLabel>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Shelf A-1" />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddDialogOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleAddItem} disabled={!partName || !partNumber || !quantity || loading}>
              {loading ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>Update item details</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Part Name *</FieldLabel>
              <Input value={partName} onChange={(e) => setPartName(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Part Number *</FieldLabel>
              <Input value={partNumber} onChange={(e) => setPartNumber(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Category</FieldLabel>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Quantity *</FieldLabel>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>Min Quantity</FieldLabel>
                <Input type="number" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Unit Cost ($)</FieldLabel>
                <Input type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>Location</FieldLabel>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleUpdateItem} disabled={!partName || !partNumber || !quantity || loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
