import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import { useFetch } from '../../hooks/useFetch'
import TableChargePoints, { type ChargePointRow } from './TableChargePoints'
import { API } from '../../config'

const CHARGEPOINTS_URL = API.chargepoints
const ORGANIZATIONS_URL = API.organizations

type OrganizationOption = {
    id: string
    name: string
}

type ChargePointApi = {
    id: string
    identity: string
    cpoId?: string
    cpo: string | { id: string; name?: string } | null
}

type ChargePointPayload = {
    identity: string
    cpoId: string
}

type DialogMode = 'view' | 'edit' | null

const getCpoId = (chargePoint: ChargePointApi | null): string => {
    if (!chargePoint) {
        return ''
    }

    if (chargePoint.cpoId) {
        return chargePoint.cpoId
    }

    const { cpo } = chargePoint

    if (!cpo) {
        return ''
    }

    if (typeof cpo === 'string') {
        return cpo
    }

    return cpo.id
}

function ChargePoints() {
    const {
        data: chargePointsData,
        loading: chargePointsLoading,
        error: chargePointsError,
        refetch,
    } = useFetch<ChargePointApi[]>(CHARGEPOINTS_URL, 'GET')

    const {
        data: organizationsData,
        loading: organizationsLoading,
        error: organizationsError,
    } = useFetch<OrganizationOption[]>(ORGANIZATIONS_URL, 'GET')

    const [identity, setIdentity] = useState('')
    const [cpoId, setCpoId] = useState('')
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const [actionError, setActionError] = useState<string | null>(null)
    const [dialogMode, setDialogMode] = useState<DialogMode>(null)
    const [activeChargePoint, setActiveChargePoint] = useState<ChargePointApi | null>(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailError, setDetailError] = useState<string | null>(null)
    const [editIdentity, setEditIdentity] = useState('')
    const [editCpoId, setEditCpoId] = useState('')
    const [editSubmitting, setEditSubmitting] = useState(false)
    const [deleteSubmitting, setDeleteSubmitting] = useState(false)
    const [chargePointToDelete, setChargePointToDelete] = useState<ChargePointRow | null>(null)

    const cpoNameById = useMemo(() => {
        const map = new Map<string, string>()

        for (const organization of organizationsData ?? []) {
            map.set(organization.id, organization.name)
        }

        return map
    }, [organizationsData])

    const rows: ChargePointRow[] = useMemo(() => {
        return (chargePointsData ?? []).map((item) => {
            const normalizedCpoId = getCpoId(item)

            return {
                id: item.id,
                identity: item.identity,
                cpo: cpoNameById.get(normalizedCpoId) ?? normalizedCpoId,
            }
        })
    }, [chargePointsData, cpoNameById])

    useEffect(() => {
        if (dialogMode !== 'edit' || !activeChargePoint) {
            return
        }

        setEditIdentity(activeChargePoint.identity)
        setEditCpoId(getCpoId(activeChargePoint))
    }, [activeChargePoint, dialogMode])

    const fetchChargePointById = async (id: string) => {
        setDetailLoading(true)
        setDetailError(null)

        try {
            const response = await fetch(`${CHARGEPOINTS_URL}/${id}`)

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }

            const chargePoint = (await response.json()) as ChargePointApi
            setActiveChargePoint(chargePoint)
        } catch (caughtError) {
            setDetailError(caughtError instanceof Error ? caughtError.message : 'Unknown error')
        } finally {
            setDetailLoading(false)
        }
    }

    const openDialog = async (mode: Exclude<DialogMode, null>, chargePoint: ChargePointRow) => {
        setDialogMode(mode)
        setActionError(null)
        setActiveChargePoint({
            id: chargePoint.id,
            identity: chargePoint.identity,
            cpo: chargePoint.cpo,
        })
        await fetchChargePointById(chargePoint.id)
    }

    const closeDialog = () => {
        setDialogMode(null)
        setActiveChargePoint(null)
        setDetailError(null)
    }

    const buildPayload = (payloadIdentity: string, payloadCpoId: string): ChargePointPayload => ({
        identity: payloadIdentity.trim(),
        cpoId: payloadCpoId,
    })

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!identity.trim()) {
            setSubmitError('Identity is required.')
            setSubmitSuccess(null)
            return
        }

        if (!cpoId) {
            setSubmitError('CPO is required.')
            setSubmitSuccess(null)
            return
        }

        setSubmitting(true)
        setSubmitError(null)
        setSubmitSuccess(null)

        try {
            const response = await fetch(CHARGEPOINTS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(buildPayload(identity, cpoId)),
            })

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }

            setIdentity('')
            setCpoId('')
            setSubmitSuccess('Charge point created successfully.')
            refetch()
        } catch (caughtError) {
            setSubmitError(caughtError instanceof Error ? caughtError.message : 'Unknown error')
        } finally {
            setSubmitting(false)
        }
    }

    const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!activeChargePoint) {
            return
        }

        if (!editIdentity.trim()) {
            setActionError('Identity is required.')
            return
        }

        if (!editCpoId) {
            setActionError('CPO is required.')
            return
        }

        setEditSubmitting(true)
        setActionError(null)

        try {
            const response = await fetch(`${CHARGEPOINTS_URL}/${activeChargePoint.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(buildPayload(editIdentity, editCpoId)),
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
        if (!chargePointToDelete) {
            return
        }

        setDeleteSubmitting(true)
        setActionError(null)

        try {
            const response = await fetch(`${CHARGEPOINTS_URL}/${chargePointToDelete.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }

            setChargePointToDelete(null)
            refetch()
        } catch (caughtError) {
            setActionError(caughtError instanceof Error ? caughtError.message : 'Unknown error')
        } finally {
            setDeleteSubmitting(false)
        }
    }

    const activeCpoId = getCpoId(activeChargePoint)
    const activeCpoLabel = cpoNameById.get(activeCpoId) ?? activeCpoId

    return (
        <Box sx={{ p: 4 }}>
            <Stack spacing={3}>
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Charge Points
                    </Typography>
                </Box>

                <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <Typography variant="h6" fontWeight={600}>
                            Create charge point
                        </Typography>

                        {submitError ? <Alert severity="error">{submitError}</Alert> : null}
                        {submitSuccess ? <Alert severity="success">{submitSuccess}</Alert> : null}

                        <TextField
                            label="Identity"
                            value={identity}
                            onChange={(event) => setIdentity(event.target.value)}
                            placeholder="EVCC_01234"
                            required
                            fullWidth
                        />

                        <TextField
                            select
                            label="CPO (Organization)"
                            value={cpoId}
                            onChange={(event) => setCpoId(event.target.value)}
                            required
                            fullWidth
                            disabled={organizationsLoading}
                            helperText={organizationsLoading ? 'Loading organizations...' : 'Select organization for this charge point'}
                        >
                            {(organizationsData ?? []).map((organization) => (
                                <MenuItem key={organization.id} value={organization.id}>
                                    {organization.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box>
                            <Button type="submit" variant="contained" disabled={submitting || organizationsLoading}>
                                {submitting ? 'Creating...' : 'Create'}
                            </Button>
                        </Box>
                    </Stack>
                </Paper>

                {chargePointsError ? <Alert severity="error">{chargePointsError}</Alert> : null}
                {organizationsError ? <Alert severity="error">{organizationsError}</Alert> : null}
                {actionError ? <Alert severity="error">{actionError}</Alert> : null}

                <TableChargePoints
                    rows={rows}
                    loading={chargePointsLoading || organizationsLoading || deleteSubmitting}
                    onView={(chargePoint) => void openDialog('view', chargePoint)}
                    onEdit={(chargePoint) => void openDialog('edit', chargePoint)}
                    onDelete={(chargePoint) => setChargePointToDelete(chargePoint)}
                />
            </Stack>

            <Dialog open={dialogMode === 'view'} onClose={closeDialog} fullWidth maxWidth="sm">
                <DialogTitle>Charge point details</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {detailError ? <Alert severity="error">{detailError}</Alert> : null}
                        <TextField
                            label="ID"
                            value={activeChargePoint?.id ?? ''}
                            fullWidth
                            slotProps={{ input: { readOnly: true } }}
                        />
                        <TextField
                            label="Identity"
                            value={activeChargePoint?.identity ?? ''}
                            fullWidth
                            slotProps={{ input: { readOnly: true } }}
                        />
                        <TextField
                            label="CPO"
                            value={activeCpoLabel}
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
                    <DialogTitle>Edit charge point</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            {detailError ? <Alert severity="error">{detailError}</Alert> : null}
                            <TextField
                                label="ID"
                                value={activeChargePoint?.id ?? ''}
                                fullWidth
                                slotProps={{ input: { readOnly: true } }}
                            />
                            <TextField
                                label="Identity"
                                value={editIdentity}
                                onChange={(event) => setEditIdentity(event.target.value)}
                                required
                                fullWidth
                            />
                            <TextField
                                select
                                label="CPO (Organization)"
                                value={editCpoId}
                                onChange={(event) => setEditCpoId(event.target.value)}
                                required
                                fullWidth
                                disabled={organizationsLoading}
                            >
                                {(organizationsData ?? []).map((organization) => (
                                    <MenuItem key={organization.id} value={organization.id}>
                                        {organization.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            {detailLoading ? <Typography color="text.secondary">Loading...</Typography> : null}
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeDialog}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={editSubmitting || detailLoading || organizationsLoading}>
                            {editSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog
                open={chargePointToDelete !== null}
                onClose={() => setChargePointToDelete(null)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Delete charge point</DialogTitle>
                <DialogContent>
                    <Typography sx={{ pt: 1 }}>
                        Delete {chargePointToDelete?.identity}? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setChargePointToDelete(null)} disabled={deleteSubmitting}>
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

export default ChargePoints
