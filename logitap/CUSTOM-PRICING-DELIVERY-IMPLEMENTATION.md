# Implementación de Precio Personalizado a Nivel de Delivery

## Progreso Actual

### ✅ COMPLETADO
1. **Interface Delivery actualizada** en `new/page.tsx`:
   - `isCustomPricing?: boolean`
   - `customPriceConcept?: string`
   - `customPriceAmount?: number`

2. **Interface Pickup simplificada** (removidos campos custom de pickup)

3. **Función `addDelivery` actualizada** para inicializar campos custom

4. **Función `toggleCustomPricing` agregada**:
   - Alterna el estado `isCustomPricing` de una entrega específica
   - Limpia los campos custom al desactivar

## ❌ PENDIENTE

### 1. REMOVER UI de Pickup-Level Custom Pricing

**Archivo**: `app/dispatches/new/page.tsx`

Buscar y ELIMINAR todo este bloque (aproximadamente líneas 460-561):
```tsx
{/* Custom Pricing Toggle */}
<div style={{ ... }}>
  <label>
    <input type="checkbox" ... />
    💰 Usar Valor Personalizado
  </label>
  ...
</div>

{/* Custom Pricing Fields */}
{pickup.pricingType === 'custom' && (
  ...
)}

{/* Deliveries - Only show if NOT custom pricing */}
{pickup.pricingType !== 'custom' && (
```

Y cambiar la última línea de vuelta a:
```tsx
{/* Deliveries */}
<div className={styles.deliveriesSection}>
```

### 2. AGREGAR UI a Delivery-Level (Botón + Campos)

**Archivo**: `app/dispatches/new/page.tsx`

**Ubicación**: Dentro del mapeo de deliveries, en la sección del campo "Valor ($)"

**Buscar** (aproximadamente línea 514):
```tsx
<FormField label="Valor ($)">
  <Input
    icon="💰"
    type="number"
    value={delivery.merchandiseValue || ''}
    onChange={(e) => updateDelivery(pickupIndex, deliveryIndex, 'merchandiseValue', e.target.value)}
    placeholder="0"
  />
</FormField>
```

**REEMPLAZAR CON**:
```tsx
<FormField label="Valor ($)" required>
  <div style={{ display: 'flex', gap: '0.5rem' }}>
    <Input
      icon="💰"
      type="number"
      value={delivery.merchandiseValue || ''}
      onChange={(e) => updateDelivery(pickupIndex, deliveryIndex, 'merchandiseValue', e.target.value)}
      placeholder="0"
      disabled={delivery.isCustomPricing}
    />

    <button
      type="button"
      onClick={() => toggleCustomPricing(pickupIndex, deliveryIndex)}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        border: 'none',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
        backgroundColor: delivery.isCustomPricing ? '#f97316' : '#374151',
        color: delivery.isCustomPricing ? 'white' : '#9ca3af',
      }}
      title="Usar valor personalizado"
    >
      <span>🔧</span>
      <span style={{ display: 'none', '@media (min-width: 640px)': { display: 'inline' } }}>
        Personalizado
      </span>
    </button>
  </div>
</FormField>

{/* Campos Custom Pricing - Mostrar si isCustomPricing es true */}
{delivery.isCustomPricing && (
  <div style={{
    marginTop: '1rem',
    marginBottom: '1rem',
    borderLeft: '4px solid #f97316',
    paddingLeft: '1rem',
    background: 'rgba(249, 115, 22, 0.05)',
    padding: '1rem',
    borderRadius: '8px'
  }}>
    {/* Warning */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      color: '#fbbf24',
      marginBottom: '1rem'
    }}>
      <span>⚠️</span>
      <span>Este precio NO usará el valor de mercadería</span>
    </div>

    <div className={styles.formGrid}>
      {/* Concepto */}
      <FormField
        label="Concepto del Valor Personalizado"
        required
      >
        <Input
          icon="📝"
          type="text"
          placeholder="Ej: Servicio express, Carga frágil"
          value={delivery.customPriceConcept || ''}
          onChange={(e) => updateDelivery(pickupIndex, deliveryIndex, 'customPriceConcept', e.target.value)}
        />
      </FormField>

      {/* Precio Personalizado */}
      <FormField
        label="Precio Personalizado ($)"
        required
      >
        <Input
          icon="💵"
          type="number"
          step="0.01"
          placeholder="50000"
          value={delivery.customPriceAmount === 0 || !delivery.customPriceAmount ? '' : delivery.customPriceAmount}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || value === null || value === undefined) {
              updateDelivery(pickupIndex, deliveryIndex, 'customPriceAmount', 0);
              return;
            }
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && numValue >= 0) {
              updateDelivery(pickupIndex, deliveryIndex, 'customPriceAmount', numValue);
            }
          }}
        />
      </FormField>
    </div>
  </div>
)}
```

### 3. ACTUALIZAR VALIDACIÓN

**Archivo**: `app/dispatches/new/page.tsx`
**Función**: `validateForm()`

**Buscar** (aproximadamente líneas 175-199):
```typescript
pickups.forEach((pickup, i) => {
  if (!pickup.laboratoryId) {
    newErrors[`pickup_${i}_lab`] = 'Selecciona un laboratorio';
  }

  // Validation for custom pricing
  if (pickup.pricingType === 'custom') {
    ...
  } else {
    ...
  }
});
```

**REEMPLAZAR CON**:
```typescript
pickups.forEach((pickup, i) => {
  if (!pickup.laboratoryId) {
    newErrors[`pickup_${i}_lab`] = 'Selecciona un laboratorio';
  }

  if (pickup.deliveries.length === 0) {
    newErrors[`pickup_${i}_deliveries`] = 'Agrega al menos una entrega';
  }

  pickup.deliveries.forEach((delivery, j) => {
    if (!delivery.pharmacyId) {
      newErrors[`pickup_${i}_delivery_${j}_pharmacy`] = 'Selecciona una farmacia';
    }

    // Validación para delivery con custom pricing
    if (delivery.isCustomPricing) {
      if (!delivery.customPriceConcept || !delivery.customPriceConcept.trim()) {
        newErrors[`pickup_${i}_delivery_${j}_concept`] = 'El concepto es requerido';
      }
      if (!delivery.customPriceAmount || delivery.customPriceAmount <= 0) {
        newErrors[`pickup_${i}_delivery_${j}_customPrice`] = 'El precio debe ser mayor a 0';
      }
    } else {
      // Validación normal - el merchandiseValue es requerido
      if (!delivery.merchandiseValue || delivery.merchandiseValue <= 0) {
        newErrors[`pickup_${i}_delivery_${j}_value`] = 'El valor es requerido';
      }
    }
  });
});
```

### 4. ACTUALIZAR PAYLOAD AL API

**Archivo**: `app/dispatches/new/page.tsx`
**Función**: `handleSubmit()`

**Buscar** (aproximadamente líneas 226-243):
```typescript
pickups: pickups.map((pickup) => ({
  laboratoryId: pickup.laboratoryId,
  pickupAddress: pickup.pickupAddress,
  pickupDate: pickup.pickupDate ? new Date(pickup.pickupDate).toISOString() : startDateTime.toISOString(),
  pickupNotes: pickup.pickupNotes,
  pricingType: pickup.pricingType || 'percentage',
  customPrice: pickup.pricingType === 'custom' ? pickup.customPrice : null,
  customPriceConcept: pickup.pricingType === 'custom' ? pickup.customPriceConcept : null,
  deliveries: pickup.pricingType === 'custom' ? [] : pickup.deliveries.map((d) => ({
    ...
  })),
}))
```

**REEMPLAZAR CON**:
```typescript
pickups: pickups.map((pickup) => ({
  laboratoryId: pickup.laboratoryId,
  pickupAddress: pickup.pickupAddress,
  pickupDate: pickup.pickupDate ? new Date(pickup.pickupDate).toISOString() : startDateTime.toISOString(),
  pickupNotes: pickup.pickupNotes,
  deliveries: pickup.deliveries.map((d) => ({
    pharmacyId: d.pharmacyId,
    invoiceNumber: d.invoiceNumber,
    productType: d.productType,
    weight: Number(d.weight) || 0,
    packages: Number(d.packages) || 1,
    deliveryNotes: d.deliveryNotes,

    // Campos de custom pricing a nivel de delivery
    isCustomPricing: d.isCustomPricing || false,
    customPriceConcept: d.isCustomPricing ? d.customPriceConcept : null,
    customPriceAmount: d.isCustomPricing ? Number(d.customPriceAmount) : null,
    merchandiseValue: d.isCustomPricing ? 0 : Number(d.merchandiseValue) || 0,
  })),
}))
```

### 5. HACER LO MISMO EN EDIT PAGE

Repetir TODOS los pasos anteriores en:
**Archivo**: `app/dispatches/[id]/edit/page.tsx`

### 6. ACTUALIZAR PRISMA SCHEMA

**Archivo**: `prisma/schema.prisma`

**Buscar** el modelo Delivery y AGREGAR:
```prisma
model Delivery {
  id                String    @id @default(uuid())
  dispatchId        String
  dispatch          Dispatch  @relation(fields: [dispatchId], references: [id], onDelete: Cascade)
  pickupId          String
  pickup            Pickup    @relation(fields: [pickupId], references: [id], onDelete: Cascade)
  pharmacyId        String
  pharmacy          Pharmacy  @relation(fields: [pharmacyId], references: [id])
  invoiceNumber     String
  merchandiseValue  Float
  orderInRoute      Int       @default(0)
  actualOrder       Int?
  productType       String    @default("medicamentos")
  weight            Float?
  packages          Int?
  latitude          Float?
  longitude         Float?
  status            String    @default("pending")
  deliveredAt       DateTime?
  deliveryNotes     String?
  deliveryProof     String?
  recipientName     String?

  // ✅ AGREGAR ESTOS CAMPOS:
  isCustomPricing      Boolean  @default(false)
  customPriceConcept   String?
  customPriceAmount    Float?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@map("deliveries")
}
```

### 7. CREAR MIGRACIÓN SQL

**Archivo**: `migration-delivery-custom-pricing.sql`

```sql
-- Add custom pricing fields to deliveries table
ALTER TABLE deliveries
ADD COLUMN IF NOT EXISTS "isCustomPricing" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE deliveries
ADD COLUMN IF NOT EXISTS "customPriceConcept" TEXT;

ALTER TABLE deliveries
ADD COLUMN IF NOT EXISTS "customPriceAmount" DOUBLE PRECISION;

-- Verify columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'deliveries'
AND column_name IN ('isCustomPricing', 'customPriceConcept', 'customPriceAmount');
```

### 8. ACTUALIZAR APIs

#### **Archivo**: `app/api/dispatches/create-complete/route.ts`

En la sección donde se crean deliveries (aproximadamente línea 77):
```typescript
await tx.delivery.create({
  data: {
    dispatchId: newDispatch.id,
    pickupId: pickup.id,
    pharmacyId: deliveryData.pharmacyId,
    invoiceNumber: deliveryData.invoiceNumber,
    merchandiseValue: deliveryData.isCustomPricing ? 0 : deliveryData.merchandiseValue,
    productType: deliveryData.productType || 'medicamentos',
    weight: deliveryData.weight,
    packages: deliveryData.packages,
    orderInRoute: i,
    status: 'pending',
    deliveryNotes: deliveryData.deliveryNotes,

    // ✅ AGREGAR:
    isCustomPricing: deliveryData.isCustomPricing || false,
    customPriceConcept: deliveryData.customPriceConcept || null,
    customPriceAmount: deliveryData.customPriceAmount || null,
  },
});
```

#### **Archivo**: `app/api/dispatches/[id]/update-complete/route.ts`

Hacer el mismo cambio en el update de deliveries.

## ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. ✅ Interfaces actualizadas (YA HECHO)
2. ✅ Funciones addDelivery y toggleCustomPricing (YA HECHO)
3. ❌ Remover UI de pickup-level custom pricing (NEW PAGE)
4. ❌ Agregar UI de delivery-level custom pricing (NEW PAGE)
5. ❌ Actualizar validación (NEW PAGE)
6. ❌ Actualizar payload (NEW PAGE)
7. ❌ Repetir pasos 3-6 en EDIT PAGE
8. ❌ Actualizar Prisma schema
9. ❌ Ejecutar migración SQL en Supabase
10. ❌ Actualizar APIs (create-complete, update-complete)
11. ❌ Probar end-to-end

## TESTING CHECKLIST

- [ ] Crear delivery normal sin custom pricing
- [ ] Crear delivery con custom pricing
- [ ] Mezclar deliveries normales y custom en mismo pickup
- [ ] Toggle funciona correctamente (activar/desactivar)
- [ ] Validación funciona en ambos modos
- [ ] Payload se envía correctamente al API
- [ ] Se guarda correctamente en BD
- [ ] Editar viaje existente y cambiar deliveries
- [ ] Calculos de totales son correctos

## NOTAS IMPORTANTES

- El campo `merchandiseValue` de delivery debe ser 0 cuando `isCustomPricing` es true
- El costo del pickup se calcula sumando valores de deliveries (normales O custom)
- El botón "Personalizado" debe cambiar de color cuando está activo
- Los campos custom solo aparecen cuando el botón está activo
- Remover completamente los campos `pricingType`, `customPrice`, y `customPriceConcept` del modelo Pickup
