import { useState } from 'react'
import { Box, Button, Paper, Stack } from '@mui/material'
import {
  DataGrid,
  type GridColDef,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'

export type ChargePointRow = {
  id: string
  identity: string
  cpo: string
}

type TableChargePointsProps = {
  rows: ChargePointRow[]
  loading?: boolean
  onView: (chargePoint: ChargePointRow) => void
  onEdit: (chargePoint: ChargePointRow) => void
  onDelete: (chargePoint: ChargePointRow) => void
}

function TableChargePoints({
  rows,
  loading = false,
  onView,
  onEdit,
  onDelete,
}: TableChargePointsProps) {
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  })

  const columns: GridColDef<ChargePointRow>[] = [
    { field: 'id', headerName: 'ID', flex: 1.2, minWidth: 240 },
    { field: 'identity', headerName: 'Identity', flex: 1, minWidth: 180 },
    { field: 'cpo', headerName: 'CPO', flex: 1, minWidth: 220 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      minWidth: 250,
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => onView(params.row)}>
            View
          </Button>
          <Button size="small" onClick={() => onEdit(params.row)}>
            Edit
          </Button>
          <Button size="small" color="error" onClick={() => onDelete(params.row)}>
            Delete
          </Button>
        </Stack>
      ),
    },
  ]

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ height: 420, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableMultipleRowSelection
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={(newSelection) => {
            const firstSelectedId = Array.from(newSelection.ids)[0]

            setSelectionModel({
              type: 'include',
              ids: firstSelectedId ? new Set([firstSelectedId]) : new Set(),
            })
          }}
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
        />
      </Box>
    </Paper>
  )
}

export default TableChargePoints