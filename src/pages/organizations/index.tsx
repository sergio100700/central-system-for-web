import { useEffect, useState, type FormEvent } from 'react'
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import { useFetch } from '../../hooks/useFetch'
import TableOrganizations, { type OrganizationRow } from './TableOrganizations'

const ORGANIZATIONS_URL = 'http://localhost:3000/organizations'

type OrganizationPayload = {
    name: string
    legalEntity?: string
}

type DialogMode = 'view' | 'edit' | null

function Organizations() {
    const { data, loading, error, refetch } = useFetch<OrganizationRow[]>(ORGANIZATIONS_URL, 'GET')
    const [name, setName] = useState('')
    const [legalEntity, setLegalEntity] = useState('')
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)
    const [dialogMode, setDialogMode] = useState<DialogMode>(null)
    const [activeOrganization, setActiveOrganization] = useState<OrganizationRow | null>(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailError, setDetailError] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editLegalEntity, setEditLegalEntity] = useState('')
    const [editSubmitting, setEditSubmitting] = useState(false)
    const [deleteSubmitting, setDeleteSubmitting] = useState(false)
    const [organizationToDelete, setOrganizationToDelete] = useState<OrganizationRow | null>(null)

    useEffect(() => {
        if (dialogMode !== 'edit' || !activeOrganization) {
            return
        }

        setEditName(activeOrganization.name)
        setEditLegalEntity(activeOrganization.legalEntity ?? '')
    }, [activeOrganization, dialogMode])

    const fetchOrganizationById = async (id: string) => {
        setDetailLoading(true)
        setDetailError(null)

        try {
            const response = await fetch(`${ORGANIZATIONS_URL}/${id}`)

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }

            const organization = (await response.json()) as OrganizationRow
            setActiveOrganization(organization)
        } catch (caughtError) {
            setDetailError(caughtError instanceof Error ? caughtError.message : 'Unknown error')
        } finally {
            setDetailLoading(false)
        }
    }

    const openDialog = async (mode: Exclude<DialogMode, null>, organization: OrganizationRow) => {
        setDialogMode(mode)
        setActiveOrganization(organization)
        setActionError(null)
        await fetchOrganizationById(organization.id)
    }

    const closeDialog = () => {
        setDialogMode(null)
        setActiveOrganization(null)
        setDetailError(null)
    }

    const buildPayload = (payloadName: string, payloadLegalEntity: string): OrganizationPayload => ({
        name: payloadName.trim(),
        legalEntity: payloadLegalEntity.trim() || undefined,
    })

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!name.trim()) {
            setSubmitError('Name is required.')
            setSubmitSuccess(null)
            return
        }

        setSubmitting(true)
        setSubmitError(null)
        setSubmitSuccess(null)

        try {
            const response = await fetch(ORGANIZATIONS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(buildPayload(name, legalEntity)),
            })

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }

            setName('')
            setLegalEntity('')
            setSubmitSuccess('Organization created successfully.')
            refetch()
        } catch (caughtError) {
            setSubmitError(caughtError instanceof Error ? caughtError.message : 'Unknown error')
        } finally {
            setSubmitting(false)
        }
    }

    const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!activeOrganization) {
            return
        }

        if (!editName.trim()) {
            setActionError('Name is required.')
            return
        }

        setEditSubmitting(true)
        setActionError(null)

        try {
            const response = await fetch(`${ORGANIZATIONS_URL}/${activeOrganization.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(buildPayload(editName, editLegalEntity)),
            })

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }

            closeDialog()
            refetch()
        } catch (caughtError) {
            setActionError(caughtError instanceof Error ? caughtError.message : 'Unknown error')
        } finally {
            setEditSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!organizationToDelete) {
            return
        }

        setDeleteSubmitting(true)
        setActionError(null)

        try {
            const response = await fetch(`${ORGANIZATIONS_URL}/${organizationToDelete.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }

            setOrganizationToDelete(null)
            refetch()
        } catch (caughtError) {
            setActionError(caughtError instanceof Error ? caughtError.message : 'Unknown error')
        } finally {
            setDeleteSubmitting(false)
        }
    }

    return (
        <Box sx={{ p: 4 }}>
            <Stack spacing={3}>
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Organizations
                    </Typography>
                    <Typography color="text.secondary">
                        Listado y alta de organizaciones
                    </Typography>
                </Box>

                <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <Typography variant="h6" fontWeight={600}>
                            Create organization
                        </Typography>

                        {submitError ? <Alert severity="error">{submitError}</Alert> : null}
                        {submitSuccess ? <Alert severity="success">{submitSuccess}</Alert> : null}

                        <TextField
                            label="Name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Legal Entity"
                            value={legalEntity}
                            onChange={(event) => setLegalEntity(event.target.value)}
                            fullWidth
                        />

                        <Box>
                            <Button type="submit" variant="contained" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create'}
                            </Button>
                        </Box>
                    </Stack>
                </Paper>

                {error ? <Alert severity="error">{error}</Alert> : null}
                {actionError ? <Alert severity="error">{actionError}</Alert> : null}

                <TableOrganizations
                    rows={data ?? []}
                    loading={loading || deleteSubmitting}
                    onView={(organization) => openDialog('view', organization)}
                    onEdit={(organization) => openDialog('edit', organization)}
                    onDelete={(organization) => setOrganizationToDelete(organization)}
                />
            </Stack>

            <Dialog open={dialogMode === 'view'} onClose={closeDialog} fullWidth maxWidth="sm">
                <DialogTitle>Organization details</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {detailError ? <Alert severity="error">{detailError}</Alert> : null}
                        <TextField
                            label="ID"
                            value={activeOrganization?.id ?? ''}
                            fullWidth
                            slotProps={{ input: { readOnly: true } }}
                        />
                        <TextField
                            label="Name"
                            value={activeOrganization?.name ?? ''}
                            fullWidth
                            slotProps={{ input: { readOnly: true } }}
                        />
                        <TextField
                            label="Legal Entity"
                            value={activeOrganization?.legalEntity ?? ''}
                            fullWidth
                            slotProps={{ input: { readOnly: true } }}
                        />
                        {detailLoading ? <Typography color="text.secondary">Loading...</Typography> : null}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={dialogMode === 'edit'} onClose={closeDialog} fullWidth maxWidth="sm">
                <Box component="form" onSubmit={handleEditSubmit}>
                    <DialogTitle>Edit organization</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            {detailError ? <Alert severity="error">{detailError}</Alert> : null}
                            <TextField
                                label="ID"
                                value={activeOrganization?.id ?? ''}
                                fullWidth
                                slotProps={{ input: { readOnly: true } }}
                            />
                            <TextField
                                label="Name"
                                value={editName}
                                onChange={(event) => setEditName(event.target.value)}
                                required
                                fullWidth
                            />
                            <TextField
                                label="Legal Entity"
                                value={editLegalEntity}
                                onChange={(event) => setEditLegalEntity(event.target.value)}
                                fullWidth
                            />
                            {detailLoading ? <Typography color="text.secondary">Loading...</Typography> : null}
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeDialog}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={editSubmitting || detailLoading}>
                            {editSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog
                open={organizationToDelete !== null}
                onClose={() => setOrganizationToDelete(null)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Delete organization</DialogTitle>
                <DialogContent>
                    <Typography sx={{ pt: 1 }}>
                        Delete {organizationToDelete?.name}? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOrganizationToDelete(null)} disabled={deleteSubmitting}>
                        Cancel
                    </Button>
                    <Button color="error" variant="contained" onClick={handleDelete} disabled={deleteSubmitting}>
                        {deleteSubmitting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default Organizations
