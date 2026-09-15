# Charge Schedule API

Base URL: `/api/v1`

- [Lookups](#lookups)
  - [GET /lookups/charge-schedule](#get-lookupscharge-schedule) - All dropdown options for the tab (charge types, currencies, frequencies, CPI indexes, reasons).
- [Charges](#charges)
  - [GET /leases/{leaseId}/charges](#get-leasesleaseidcharges) - List a lease's charges with their current term (card and table view).
  - [GET /charges/{chargeId}](#get-chargeschargeid) - Get one charge with all its term periods.
  - [POST /leases/{leaseId}/charges/preview](#post-leasesleaseidchargespreview) - Preview the escalations and schedule a new charge would create.
  - [POST /leases/{leaseId}/charges](#post-leasesleaseidcharges) - Create a charge with its first term.
  - [POST /charges/{chargeId}/preview](#post-chargeschargeidpreview) - Preview the schedule changes of editing a charge.
  - [PATCH /charges/{chargeId}](#patch-chargeschargeid) - Update a charge's fields.
  - [DELETE /charges/{chargeId}](#delete-chargeschargeid) - Delete a charge.
- [End Date](#end-date)
  - [POST /charges/{chargeId}/end-date/preview](#post-chargeschargeidend-datepreview) - Preview the rows removed or created by changing the end date.
  - [PUT /charges/{chargeId}/end-date](#put-chargeschargeidend-date) - Set or clear a charge's End Date Override.
- [Terms](#terms)
  - [POST /charges/{chargeId}/terms/preview](#post-chargeschargeidtermspreview) - Preview the schedule a new term would create.
  - [POST /charges/{chargeId}/terms](#post-chargeschargeidterms) - Add a term period to a charge.
  - [POST /charges/{chargeId}/terms/{termId}/preview](#post-chargeschargeidtermstermidpreview) - Preview rebuilding the schedule of an edited term.
  - [PUT /charges/{chargeId}/terms/{termId}](#put-chargeschargeidtermstermid) - Update a term period and rebuild its schedule.
- [Rent Adjustments](#rent-adjustments)
  - [GET /charges/{chargeId}/adjustments](#get-chargeschargeidadjustments) - List a charge's abatements, reductions and grace periods.
  - [POST /charges/{chargeId}/adjustments/preview](#post-chargeschargeidadjustmentspreview) - Preview the schedule changes of a new adjustment.
  - [POST /charges/{chargeId}/adjustments](#post-chargeschargeidadjustments) - Create an abatement, reduction or grace period.
  - [POST /charges/{chargeId}/adjustments/{adjustmentId}/preview](#post-chargeschargeidadjustmentsadjustmentidpreview) - Preview the schedule changes of editing an adjustment.
  - [PUT /charges/{chargeId}/adjustments/{adjustmentId}](#put-chargeschargeidadjustmentsadjustmentid) - Update an adjustment.
  - [DELETE /charges/{chargeId}/adjustments/{adjustmentId}](#delete-chargeschargeidadjustmentsadjustmentid) - Delete an adjustment.
- [Schemas](#schemas)

---

## Lookups

### GET /lookups/charge-schedule

**Query parameters**

| Name | Type | Required |
|---|---|---|
| `leaseId` | string | yes |

**Responses**

`200 OK`

```json
{
  "chargeTypes": [
    { "code": "RENTA_TORRE",  "name": "Renta Torre",      "share": "100.00", "category": "RENT" },
    { "code": "BLENDED_RATE", "name": "Blended Rate",     "share": "100.00", "category": "RENT" },
    { "code": "GROUND_PASS",  "name": "Ground Pass-Thru", "share": null,     "category": "PASS_THROUGH" }
  ],
  "currencies": [
    { "code": "USD", "label": "US Dollars",      "symbol": "US$" },
    { "code": "COP", "label": "Colombian Pesos", "symbol": "COP$" }
  ],
  "startsOn": [
    { "code": "OTHER",             "label": "Other",             "date": null },
    { "code": "COMMENCEMENT",      "label": "Commencement",      "date": "2022-02-26" },
    { "code": "LEASE_SIGNING",     "label": "Lease Signing",     "date": null },
    { "code": "NOTICE_TO_PROCEED", "label": "Notice To Proceed", "date": null }
  ],
  "billingFrequencies": [
    { "code": "MONTHLY",     "label": "Monthly",     "months": 1 },
    { "code": "QUARTERLY",   "label": "Quarterly",   "months": 3 },
    { "code": "SEMI_ANNUAL", "label": "Semi-Annual", "months": 6 },
    { "code": "ANNUAL",      "label": "Annual",      "months": 12 }
  ],
  "escalationTypes": [
    { "code": "CPI",        "label": "CPI" },
    { "code": "FIXED",      "label": "Fixed" },
    { "code": "PERCENTAGE", "label": "Percentage" },
    { "code": "NONE",       "label": "None" }
  ],
  "cpiIndexes": [
    { "code": "IPC_USA", "label": "IPC For USA" },
    { "code": "IPC_COL", "label": "IPC Colombia" },
    { "code": "CPI_U",   "label": "CPI-U All Items" }
  ],
  "adjustmentReasons": [
    { "code": "ATT_PROGRAM",      "label": "AT&T Rent Reduction Program" },
    { "code": "PREVENT_CHURN",    "label": "Reduced to prevent churn" },
    { "code": "NEW_BUSINESS",     "label": "Reduction exchanged for new business" },
    { "code": "NEW_TENANT",       "label": "Reduction for a new tenant on the site" },
    { "code": "MARKET_RATE",      "label": "Reduction for adjustment to Market rate" },
    { "code": "VOLUME_INCENTIVE", "label": "Volume Rent incentive reduction" }
  ],
  "links": {
    "womPortfolioCharges": "https://.../wom/charges"
  }
}
```

`400 Bad Request` - [Error](#error)

`404 Not Found` - [Error](#error)

---

## Charges

### GET /leases/{leaseId}/charges

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `leaseId` | string | yes |

**Query parameters**

| Name | Type | Required | Default |
|---|---|---|---|
| `asOf` | string (date) | no | today |
| `include` | string, enum: `termPeriods` | no | - |

**Responses**

`200 OK`

```json
{
  "leaseId": "2166",
  "asOf": "2026-09-15",
  "total": 1,
  "items": [
    {
      "id": "chg_90871",
      "leaseId": "2166",
      "version": "7",
      "category": "RENT",
      "chargeType": { "code": "RENTA_TORRE", "name": "Renta Torre", "share": "100.00" },
      "status": "ACTIVE",
      "badge": null,
      "initialCharge": "0.01",
      "scheduleCurrency": "USD",
      "billingCurrency": "USD",
      "startsOn": "OTHER",
      "startDate": "2025-01-01",
      "endDateOverride": "2034-12-31",
      "cycleDate": "2025-01-01",
      "currentTerm": {
        "termId": "trm_2",
        "number": 2,
        "startDate": "2026-07-01",
        "endDate": "2026-12-31",
        "amount": "891.46",
        "billingFrequency": "MONTHLY",
        "escalationType": "FIXED",
        "escalationAmount": "118.86",
        "cpiAdjustment": null,
        "escalationFrequency": 12,
        "cpiIndex": null
      }
    }
  ]
}
```

`404 Not Found` - [Error](#error)

---

### GET /charges/{chargeId}

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `chargeId` | string | yes |

**Query parameters**

| Name | Type | Required | Default |
|---|---|---|---|
| `asOf` | string (date) | no | today |

**Responses**

`200 OK` - [Charge](#charge)

| Header | Value |
|---|---|
| `ETag` | `"7"` |

`404 Not Found` - [Error](#error)

---

### POST /leases/{leaseId}/charges/preview

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `leaseId` | string | yes |

**Request body**

```json
{
  "chargeTypeCode": "RENTA_TORRE",
  "initialCharge": "0.01",
  "scheduleCurrency": "USD",
  "billingCurrency": "USD",
  "startsOn": "OTHER",
  "startDate": "2025-01-01",
  "cycleDate": null,
  "firstTerm": {
    "billingFrequency": "MONTHLY",
    "escalationFrequency": 12,
    "escalationType": "CPI",
    "escalationAmount": null,
    "escalatesWithCommencement": false,
    "escalationAnniversary": null,
    "cpiIndex": "IPC_USA",
    "cpiAdjustment": null
  }
}
```

**Responses**

`200 OK`

```json
{
  "resolved": {
    "startDate": "2025-01-01",
    "firstTermStartDate": "2025-01-01",
    "firstTermAmount": "0.01"
  },
  "preview": { "$ref": "#/SchedulePreview" }
}
```

`400 Bad Request` - [Error](#error)

`404 Not Found` - [Error](#error)

`422 Unprocessable Entity` - [Error](#error)

---

### POST /leases/{leaseId}/charges

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `leaseId` | string | yes |

**Request body**

```json
{
  "chargeTypeCode": "RENTA_TORRE",
  "initialCharge": "0.01",
  "scheduleCurrency": "USD",
  "billingCurrency": "USD",
  "startsOn": "OTHER",
  "startDate": "2025-01-01",
  "cycleDate": null,
  "firstTerm": {
    "billingFrequency": "MONTHLY",
    "escalationFrequency": 12,
    "escalationType": "CPI",
    "escalationAmount": null,
    "escalatesWithCommencement": false,
    "escalationAnniversary": null,
    "cpiIndex": "IPC_USA",
    "cpiAdjustment": null
  },
  "changeReason": "New tower rent per contract amendment 3"
}
```

**Responses**

`201 Created` - [Charge](#charge)

| Header | Value |
|---|---|
| `Location` | `/api/v1/charges/chg_90871` |
| `ETag` | `"1"` |

`400 Bad Request` - [Error](#error)

`404 Not Found` - [Error](#error)

`422 Unprocessable Entity` - [Error](#error)

---

### POST /charges/{chargeId}/preview

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `chargeId` | string | yes |

**Headers**

| Name | Type | Required |
|---|---|---|
| `If-Match` | string | yes |

**Request body**

```json
{
  "initialCharge": "0.01",
  "scheduleCurrency": "USD",
  "billingCurrency": "USD",
  "startsOn": "OTHER",
  "startDate": "2025-01-01",
  "cycleDate": "2025-01-01"
}
```

**Responses**

`200 OK` - [SchedulePreview](#schedulepreview)

`400 Bad Request` - [Error](#error)

`404 Not Found` - [Error](#error)

`412 Precondition Failed` - [Error](#error)

`422 Unprocessable Entity` - [Error](#error)

`428 Precondition Required` - [Error](#error)

---

### PATCH /charges/{chargeId}

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `chargeId` | string | yes |

**Headers**

| Name | Type | Required |
|---|---|---|
| `If-Match` | string | yes |

**Request body**

```json
{
  "initialCharge": "0.01",
  "scheduleCurrency": "USD",
  "billingCurrency": "USD",
  "startsOn": "OTHER",
  "startDate": "2025-01-01",
  "cycleDate": "2025-01-01",
  "changeReason": "Billing cycle date corrected"
}
```

**Responses**

`200 OK` - [Charge](#charge)

| Header | Value |
|---|---|
| `ETag` | `"8"` |

`400 Bad Request` - [Error](#error)

`404 Not Found` - [Error](#error)

`412 Precondition Failed` - [Error](#error)

`422 Unprocessable Entity` - [Error](#error)

`428 Precondition Required` - [Error](#error)

---

### DELETE /charges/{chargeId}

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `chargeId` | string | yes |

**Headers**

| Name | Type | Required |
|---|---|---|
| `If-Match` | string | yes |

**Request body**

```json
{
  "changeReason": "Charge entered on the wrong lease"
}
```

**Responses**

`204 No Content`

`404 Not Found` - [Error](#error)

`409 Conflict` - [Error](#error)

`412 Precondition Failed` - [Error](#error)

`422 Unprocessable Entity` - [Error](#error)

`428 Precondition Required` - [Error](#error)

---

## End Date

### POST /charges/{chargeId}/end-date/preview

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `chargeId` | string | yes |

**Query parameters**

| Name | Type | Required | Default |
|---|---|---|---|
| `horizonMonths` | integer | no | 24 |

**Headers**

| Name | Type | Required |
|---|---|---|
| `If-Match` | string | yes |

**Request body**

```json
{
  "endDateOverride": "2026-05-31"
}
```

**Responses**

`200 OK`

```json
{
  "oldEndDate": "2034-12-31",
  "newEndDate": "2026-05-31",
  "direction": "SHORTEN",
  "preview": { "$ref": "#/SchedulePreview" }
}
```

`400 Bad Request` - [Error](#error)

`404 Not Found` - [Error](#error)

`412 Precondition Failed` - [Error](#error)

`422 Unprocessable Entity` - [Error](#error)

`428 Precondition Required` - [Error](#error)

---

### PUT /charges/{chargeId}/end-date

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `chargeId` | string | yes |

**Headers**

| Name | Type | Required |
|---|---|---|
| `If-Match` | string | yes |

**Request body**

```json
{
  "endDateOverride": "2026-05-31",
  "changeReason": "Tenant gave notice of termination"
}
```

**Responses**

`200 OK` - [Charge](#charge)

| Header | Value |
|---|---|
| `ETag` | `"8"` |

`400 Bad Request` - [Error](#error)

`404 Not Found` - [Error](#error)

`409 Conflict` - [Error](#error)

`412 Precondition Failed` - [Error](#error)

`422 Unprocessable Entity` - [Error](#error)

`428 Precondition Required` - [Error](#error)

---

## Terms

### POST /charges/{chargeId}/terms/preview

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `chargeId` | string | yes |

**Headers**

| Name | Type | Required |
|---|---|---|
| `If-Match` | string | yes |

**Request body**

```json
{
  "startDate": "2027-01-01",
  "amount": "1010.32",
  "billingFrequency": "MONTHLY",
  "escalationFrequency": 12,
  "escalationType": "PERCENTAGE",
  "escalationAmount": "5.00",
  "escalatesWithCommencement": true,
  "escalationAnniversary": "2028-01-01",
  "cpiIndex": null,
  "cpiAdjustment": null
}
```

**Responses**

`200 OK`

```json
{
  "insertedAt": 3,
  "ranges": [
    { "number": 1, "startDate": "2025-01-01", "endDate": "2026-06-30" },
    { "number": 2, "startDate": "2026-07-01", "endDate": "2026-12-31" },
    { "number": 3, "startDate": "2027-01-01", "endDate": "2034-12-31" }
  ],
  "preview": { "$ref": "#/SchedulePreview" }
}
```

`400 Bad Request` - [Error](#error)

`404 Not Found` - [Error](#error)

`412 Precondition Failed` - [Error](#error)

`422 Unprocessable Entity` - [Error](#error)

`428 Precondition Required` - [Error](#error)

---

### POST /charges/{chargeId}/terms

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `chargeId` | string | yes |

**Headers**

| Name | Type | Required |
|---|---|---|
| `If-Match` | string | yes |

**Request body**

```json
{
  "startDate": "2027-01-01",
  "amount": "1010.32",
  "billingFrequency": "MONTHLY",
  "escalationFrequency": 12,
  "escalationType": "PERCENTAGE",
  "escalationAmount": "5.00",
  "escalatesWithCommencement": true,
  "escalationAnniversary": "2028-01-01",
  "cpiIndex": null,
  "cpiAdjustment": null,
  "changeReason": "Rent step agreed in amendment 4"
}
```

**Responses**

`201 Created` - [Charge](#charge)

| Header | Value |
|---|---|
| `Location` | `/api/v1/charges/chg_90871/terms/trm_3` |
| `ETag` | `"8"` |

`400 Bad Request` - [Error](#error)

`404 Not Found` - [Error](#error)

`409 Conflict` - [Error](#error)

`412 Precondition Failed` - [Error](#error)

`422 Unprocessable Entity` - [Error](#error)

`428 Precondition Required` - [Error](#error)

---

### POST /charges/{chargeId}/terms/{termId}/preview

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `chargeId` | string | yes |
| `termId` | string | yes |

**Headers**

| Name | Type | Required |
|---|---|---|
| `If-Match` | string | yes |

**Request body**

```json
{
  "startDate": "2026-07-01",
  "amount": "891.46",
  "billingFrequency": "MONTHLY",
  "escalationFrequency": 12,
  "escalationType": "FIXED",
  "escalationAmount": "118.86",
  "escalatesWithCommencement": false,
  "escalationAnniversary": null,
  "cpiIndex": null,
  "cpiAdjustment": null
}
```

**Responses**

`200 OK` - [SchedulePreview](#schedulepreview)

`400 Bad Request` - [Error](#error)

`404 Not Found` - [Error](#error)

`412 Precondition Failed` - [Error](#error)

`422 Unprocessable Entity` - [Error](#error)

`428 Precondition Required` - [Error](#error)

---

### PUT /charges/{chargeId}/terms/{termId}

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `chargeId` | string | yes |
| `termId` | string | yes |

**Headers**

| Name | Type | Required |
|---|---|---|
| `If-Match` | string | yes |

**Request body**

```json
{
  "startDate": "2026-07-01",
  "amount": "891.46",
  "billingFrequency": "MONTHLY",
  "escalationFrequency": 12,
  "escalationType": "FIXED",
  "escalationAmount": "118.86",
  "escalatesWithCommencement": false,
  "escalationAnniversary": null,
  "cpiIndex": null,
  "cpiAdjustment": null,
  "changeReason": "Escalation amount corrected"
}
```

**Responses**

`200 OK` - [Charge](#charge)

| Header | Value |
|---|---|
| `ETag` | `"8"` |

`400 Bad Request` - [Error](#error)

`404 Not Found` - [Error](#error)

`409 Conflict` - [Error](#error)

`412 Precondition Failed` - [Error](#error)

`422 Unprocessable Entity` - [Error](#error)

`428 Precondition Required` - [Error](#error)

---

## Rent Adjustments

### GET /charges/{chargeId}/adjustments

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `chargeId` | string | yes |

**Query parameters**

| Name | Type | Required | Default |
|---|---|---|---|
| `type` | array of string, enum: `ABATEMENT`, `REDUCTION`, `GRACE_PERIOD` | no | all |

**Responses**

`200 OK`

```json
{
  "chargeId": "chg_90871",
  "abatements": [
    {
      "id": "adj_301",
      "type": "ABATEMENT",
      "fromDate": "2025-03-01",
      "endDate": "2025-05-31",
      "amount": "150.00",
      "percentage": null,
      "reason": { "code": "VOLUME_INCENTIVE", "label": "Volume Rent incentive reduction" },
      "comments": "Site access restricted during repairs"
    }
  ],
  "reductions": [
    {
      "id": "adj_311",
      "type": "REDUCTION",
      "fromDate": "2029-01-01",
      "endDate": "2029-12-31",
      "amount": null,
      "percentage": "7.50",
      "reason": { "code": "MARKET_RATE", "label": "Reduction for adjustment to Market rate" },
      "comments": "Agreed with the landlord for 2029"
    }
  ],
  "gracePeriods": [
    {
      "id": "adj_321",
      "type": "GRACE_PERIOD",
      "fromDate": "2022-02-26",
      "endDate": "2022-04-25",
      "amount": null,
      "percentage": null,
      "reason": { "code": "NEW_TENANT", "label": "Reduction for a new tenant on the site" },
      "comments": "Rent free while the equipment is installed"
    }
  ]
}
```

| Header | Value |
|---|---|
| `ETag` | `"7"` |

`400 Bad Request` - [Error](#error)

`404 Not Found` - [Error](#error)

---

### POST /charges/{chargeId}/adjustments/preview

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `chargeId` | string | yes |

**Headers**

| Name | Type | Required |
|---|---|---|
| `If-Match` | string | yes |

**Request body**

```json
{
  "type": "ABATEMENT",
  "fromDate": "2025-03-01",
  "endDate": "2025-05-31",
  "amount": "150.00",
  "percentage": null,
  "reasonCode": "VOLUME_INCENTIVE",
  "comments": "Site access restricted during repairs"
}
```

**Responses**

`200 OK` - [SchedulePreview](#schedulepreview)

`400 Bad Request` - [Error](#error)

`404 Not Found` - [Error](#error)

`412 Precondition Failed` - [Error](#error)

`422 Unprocessable Entity` - [Error](#error)

`428 Precondition Required` - [Error](#error)

---

### POST /charges/{chargeId}/adjustments

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `chargeId` | string | yes |

**Headers**

| Name | Type | Required |
|---|---|---|
| `If-Match` | string | yes |

**Request body**

```json
{
  "type": "ABATEMENT",
  "fromDate": "2025-03-01",
  "endDate": "2025-05-31",
  "amount": "150.00",
  "percentage": null,
  "reasonCode": "VOLUME_INCENTIVE",
  "comments": "Site access restricted during repairs",
  "changeReason": "Abatement agreed for site repairs"
}
```

**Responses**

`201 Created` - [RentAdjustment](#rentadjustment)

| Header | Value |
|---|---|
| `Location` | `/api/v1/charges/chg_90871/adjustments/adj_301` |
| `ETag` | `"8"` |

`400 Bad Request` - [Error](#error)

`404 Not Found` - [Error](#error)

`409 Conflict` - [Error](#error)

`412 Precondition Failed` - [Error](#error)

`422 Unprocessable Entity` - [Error](#error)

`428 Precondition Required` - [Error](#error)

---

### POST /charges/{chargeId}/adjustments/{adjustmentId}/preview

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `chargeId` | string | yes |
| `adjustmentId` | string | yes |

**Headers**

| Name | Type | Required |
|---|---|---|
| `If-Match` | string | yes |

**Request body**

```json
{
  "type": "REDUCTION",
  "fromDate": "2029-01-01",
  "endDate": "2029-12-31",
  "amount": null,
  "percentage": "7.50",
  "reasonCode": "MARKET_RATE",
  "comments": "Agreed with the landlord for 2029"
}
```

**Responses**

`200 OK` - [SchedulePreview](#schedulepreview)

`400 Bad Request` - [Error](#error)

`404 Not Found` - [Error](#error)

`412 Precondition Failed` - [Error](#error)

`422 Unprocessable Entity` - [Error](#error)

`428 Precondition Required` - [Error](#error)

---

### PUT /charges/{chargeId}/adjustments/{adjustmentId}

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `chargeId` | string | yes |
| `adjustmentId` | string | yes |

**Headers**

| Name | Type | Required |
|---|---|---|
| `If-Match` | string | yes |

**Request body**

```json
{
  "type": "REDUCTION",
  "fromDate": "2029-01-01",
  "endDate": "2029-12-31",
  "amount": null,
  "percentage": "7.50",
  "reasonCode": "MARKET_RATE",
  "comments": "Agreed with the landlord for 2029",
  "changeReason": "Reduction percentage corrected"
}
```

**Responses**

`200 OK` - [RentAdjustment](#rentadjustment)

| Header | Value |
|---|---|
| `ETag` | `"8"` |

`400 Bad Request` - [Error](#error)

`404 Not Found` - [Error](#error)

`409 Conflict` - [Error](#error)

`412 Precondition Failed` - [Error](#error)

`422 Unprocessable Entity` - [Error](#error)

`428 Precondition Required` - [Error](#error)

---

### DELETE /charges/{chargeId}/adjustments/{adjustmentId}

**Path parameters**

| Name | Type | Required |
|---|---|---|
| `chargeId` | string | yes |
| `adjustmentId` | string | yes |

**Headers**

| Name | Type | Required |
|---|---|---|
| `If-Match` | string | yes |

**Request body**

```json
{
  "changeReason": "Abatement entered twice"
}
```

**Responses**

`204 No Content`

| Header | Value |
|---|---|
| `ETag` | `"8"` |

`404 Not Found` - [Error](#error)

`409 Conflict` - [Error](#error)

`412 Precondition Failed` - [Error](#error)

`422 Unprocessable Entity` - [Error](#error)

`428 Precondition Required` - [Error](#error)

---

## Schemas

### Charge

```json
{
  "id": "chg_90871",
  "leaseId": "2166",
  "version": "7",
  "category": "RENT",
  "chargeType": { "code": "RENTA_TORRE", "name": "Renta Torre", "share": "100.00" },
  "status": "ACTIVE",
  "badge": null,
  "initialCharge": "0.01",
  "scheduleCurrency": "USD",
  "billingCurrency": "USD",
  "startsOn": "OTHER",
  "startDate": "2025-01-01",
  "endDateOverride": "2034-12-31",
  "cycleDate": "2025-01-01",
  "currentTerm": {
    "termId": "trm_2",
    "number": 2,
    "startDate": "2026-07-01",
    "endDate": "2026-12-31",
    "amount": "891.46",
    "billingFrequency": "MONTHLY",
    "escalationType": "FIXED",
    "escalationAmount": "118.86",
    "cpiAdjustment": null,
    "escalationFrequency": 12,
    "cpiIndex": null
  },
  "termPeriods": [
    {
      "id": "trm_1",
      "number": 1,
      "startDate": "2025-01-01",
      "endDate": "2026-06-30",
      "amount": "0.01",
      "billingFrequency": "MONTHLY",
      "escalationType": "CPI",
      "escalationAmount": null,
      "escalationFrequency": 12,
      "escalatesWithCommencement": false,
      "escalationAnniversary": null,
      "cpiIndex": "IPC_USA",
      "cpiAdjustment": null,
      "locked": { "startDate": true, "amount": true }
    },
    {
      "id": "trm_2",
      "number": 2,
      "startDate": "2026-07-01",
      "endDate": "2026-12-31",
      "amount": "891.46",
      "billingFrequency": "MONTHLY",
      "escalationType": "FIXED",
      "escalationAmount": "118.86",
      "escalationFrequency": 12,
      "escalatesWithCommencement": false,
      "escalationAnniversary": null,
      "cpiIndex": null,
      "cpiAdjustment": null,
      "locked": { "startDate": false, "amount": false }
    },
    {
      "id": "trm_3",
      "number": 3,
      "startDate": "2027-01-01",
      "endDate": "2034-12-31",
      "amount": "1010.32",
      "billingFrequency": "MONTHLY",
      "escalationType": "PERCENTAGE",
      "escalationAmount": "5.00",
      "escalationFrequency": 12,
      "escalatesWithCommencement": true,
      "escalationAnniversary": "2028-01-01",
      "cpiIndex": null,
      "cpiAdjustment": "2.40",
      "locked": { "startDate": false, "amount": false }
    }
  ]
}
```

| Field | Type | Nullable |
|---|---|---|
| `id` | string | no |
| `leaseId` | string | no |
| `version` | string | no |
| `category` | string, enum: `RENT`, `PASS_THROUGH` | no |
| `chargeType.code` | string | no |
| `chargeType.name` | string | no |
| `chargeType.share` | string (decimal) | yes |
| `status` | string, enum: `ACTIVE` | no |
| `badge` | string | yes |
| `initialCharge` | string (decimal) | no |
| `scheduleCurrency` | string, enum: `USD`, `COP` | no |
| `billingCurrency` | string, enum: `USD`, `COP` | no |
| `startsOn` | string, enum: `OTHER`, `COMMENCEMENT`, `LEASE_SIGNING`, `NOTICE_TO_PROCEED` | no |
| `startDate` | string (date) | no |
| `endDateOverride` | string (date) | yes |
| `cycleDate` | string (date) | yes |
| `currentTerm` | object | yes |
| `termPeriods` | array of [TermPeriod](#termperiod) | no |

### TermPeriod

| Field | Type | Nullable |
|---|---|---|
| `id` | string | no |
| `number` | integer | no |
| `startDate` | string (date) | no |
| `endDate` | string (date) | yes |
| `amount` | string (decimal) | yes |
| `billingFrequency` | string, enum: `MONTHLY`, `QUARTERLY`, `SEMI_ANNUAL`, `ANNUAL` | no |
| `escalationType` | string, enum: `CPI`, `FIXED`, `PERCENTAGE`, `NONE` | no |
| `escalationAmount` | string (decimal) | yes |
| `escalationFrequency` | integer | no |
| `escalatesWithCommencement` | boolean | no |
| `escalationAnniversary` | string (date) | yes |
| `cpiIndex` | string | yes |
| `cpiAdjustment` | string (decimal) | yes |
| `locked.startDate` | boolean | no |
| `locked.amount` | boolean | no |

### RentAdjustment

```json
{
  "id": "adj_311",
  "type": "REDUCTION",
  "fromDate": "2029-01-01",
  "endDate": "2029-12-31",
  "amount": null,
  "percentage": "7.50",
  "reason": { "code": "MARKET_RATE", "label": "Reduction for adjustment to Market rate" },
  "comments": "Agreed with the landlord for 2029"
}
```

| Field | Type | Nullable |
|---|---|---|
| `id` | string | no |
| `type` | string, enum: `ABATEMENT`, `REDUCTION`, `GRACE_PERIOD` | no |
| `fromDate` | string (date) | no |
| `endDate` | string (date) | no |
| `amount` | string (decimal) | yes |
| `percentage` | string (decimal) | yes |
| `reason` | object `{ code, label }` | yes |
| `comments` | string | yes |

### SchedulePreview

```json
{
  "currency": "COP",
  "panels": ["ESCALATIONS", "SCHEDULE"],
  "scope": { "termId": "trm_1", "from": "2022-02-26", "to": "2022-12-31" },
  "summary": {
    "escalations": { "NEW": 1, "MODIFIED": 1, "UNMODIFIED": 2, "REMOVE": 1 },
    "schedule":    { "NEW": 3, "MODIFIED": 2, "UNMODIFIED": 6, "REMOVE": 1 }
  },
  "escalations": [
    {
      "id": "esc_1001",
      "termId": "trm_1",
      "dateFrom": "2022-02-26",
      "dateTo": "2022-02-27",
      "billingFrequency": "MONTHLY",
      "chargeAmount": "1750000.00",
      "chargeLabel": null,
      "escalationType": "CPI",
      "escalationAmount": "13.12",
      "escalationAmountUnit": "PERCENT",
      "state": "REMOVE",
      "otherTerm": false
    }
  ],
  "schedule": [
    {
      "id": "sch_5001",
      "termId": "trm_1",
      "billOnDate": "2022-02-01",
      "periodFrom": "2022-02-26",
      "periodTo": "2022-02-28",
      "total": "307383.67",
      "billingBatch": null,
      "adjustment": false,
      "prorated": true,
      "prorationParts": [
        {
          "from": "2022-02-26",
          "to": "2022-02-27",
          "escalationAmount": "1750000.00",
          "scheduleCharge": "125000.00",
          "escalationType": "CPI",
          "label": null
        },
        {
          "from": "2022-02-28",
          "to": "2022-02-28",
          "escalationAmount": "1844302.00",
          "scheduleCharge": "65867.93",
          "escalationType": "CPI",
          "label": null
        }
      ],
      "state": "MODIFIED",
      "otherTerm": false
    }
  ]
}
```

| Field | Type | Nullable |
|---|---|---|
| `currency` | string, enum: `USD`, `COP` | no |
| `panels` | array of string, enum: `ESCALATIONS`, `SCHEDULE` | no |
| `scope.termId` | string | yes |
| `scope.from` | string (date) | yes |
| `scope.to` | string (date) | yes |
| `summary.escalations` | object, keys: `NEW`, `MODIFIED`, `UNMODIFIED`, `REMOVE` | no |
| `summary.schedule` | object, keys: `NEW`, `MODIFIED`, `UNMODIFIED`, `REMOVE` | no |
| `escalations[].id` | string | yes |
| `escalations[].termId` | string | no |
| `escalations[].dateFrom` | string (date) | no |
| `escalations[].dateTo` | string (date) | no |
| `escalations[].billingFrequency` | string, enum: `MONTHLY`, `QUARTERLY`, `SEMI_ANNUAL`, `ANNUAL` | no |
| `escalations[].chargeAmount` | string (decimal) | no |
| `escalations[].chargeLabel` | string | yes |
| `escalations[].escalationType` | string, enum: `CPI`, `FIXED`, `PERCENTAGE`, `NONE` | no |
| `escalations[].escalationAmount` | string (decimal) | yes |
| `escalations[].escalationAmountUnit` | string, enum: `PERCENT`, `MONEY` | yes |
| `escalations[].state` | string, enum: `NEW`, `MODIFIED`, `UNMODIFIED`, `REMOVE` | no |
| `escalations[].otherTerm` | boolean | no |
| `schedule[].id` | string | yes |
| `schedule[].termId` | string | no |
| `schedule[].billOnDate` | string (date) | no |
| `schedule[].periodFrom` | string (date) | no |
| `schedule[].periodTo` | string (date) | no |
| `schedule[].total` | string (decimal) | no |
| `schedule[].billingBatch` | string | yes |
| `schedule[].adjustment` | boolean | no |
| `schedule[].prorated` | boolean | no |
| `schedule[].prorationParts[].from` | string (date) | no |
| `schedule[].prorationParts[].to` | string (date) | no |
| `schedule[].prorationParts[].escalationAmount` | string (decimal) | no |
| `schedule[].prorationParts[].scheduleCharge` | string (decimal) | no |
| `schedule[].prorationParts[].escalationType` | string, enum: `CPI`, `FIXED`, `PERCENTAGE`, `NONE` | no |
| `schedule[].prorationParts[].label` | string | yes |
| `schedule[].state` | string, enum: `NEW`, `MODIFIED`, `UNMODIFIED`, `REMOVE` | no |
| `schedule[].otherTerm` | boolean | no |

### Error

```json
{
  "status": 422,
  "code": "VALIDATION_FAILED",
  "message": "The request has invalid fields.",
  "errors": [
    { "field": "endDate", "code": "END_BEFORE_FROM", "message": "The end date cannot be before the from date." }
  ]
}
```

| Field | Type | Nullable |
|---|---|---|
| `status` | integer | no |
| `code` | string | no |
| `message` | string | no |
| `errors[].field` | string | yes |
| `errors[].code` | string | no |
| `errors[].message` | string | no |
