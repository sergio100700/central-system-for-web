import { useState } from 'react'
import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import {
  DataGrid,
  type GridColDef,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'

export type OrganizationRow = {
  id: string
  name: string
  legalEntity?: string | null
}

type TableOrganizationsProps = {
  rows: OrganizationRow[]
  loading?: boolean
  onView: (organization: OrganizationRow) => void
  onEdit: (organization: OrganizationRow) => void
  onDelete: (organization: OrganizationRow) => void
}

function TableOrganizations({
  rows,
  loading = false,
  onView,
  onEdit,
  onDelete,
}: TableOrganizationsProps) {
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  })

  const columns: GridColDef<OrganizationRow>[] = [
    { field: 'id', headerName: 'ID', flex: 1.2, minWidth: 240 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 180 },
    {
      field: 'legalEntity',
      headerName: 'Legal Entity',
      flex: 1,
      minWidth: 220,
      valueGetter: (_, row) => row.legalEntity || '-',
    },
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

      <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
        Seleccionada:{' '}
        {selectionModel.ids.size > 0
          ? Array.from(selectionModel.ids)[0]
          : 'ninguna'}
      </Typography>
    </Paper>
  )
}

export default TableOrganizations