import { Router } from 'express'
import { register, login, me }                                         from '../controllers/auth.controller.js'
import { submitRegistration, listRegistrations, getRegistration,
         approveRegistration, rejectRegistration, getStats }           from '../controllers/registration.controller.js'
import { listCourses, createCourse, updateCourse }                     from '../controllers/course.controller.js'
import { listUsers, assignRole, updateUser, deactivateUser,
         pendingRoleAssignment }                                        from '../controllers/user.controller.js'
import { authenticate, authorize }                                      from '../middleware/auth.js'

const router = Router()

router.post('/auth/register', register)
router.post('/auth/login',    login)
router.get( '/auth/me',       authenticate, me)

router.get( '/courses',      authenticate, listCourses)
router.post('/courses',      authenticate, authorize('admin'), createCourse)
router.patch('/courses/:id', authenticate, authorize('admin'), updateCourse)

router.get( '/registrations/stats',       authenticate, authorize('admin'), getStats)
router.get( '/registrations',             authenticate, listRegistrations)
router.post('/registrations',             authenticate, authorize('student'), submitRegistration)
router.get( '/registrations/:id',         authenticate, getRegistration)
router.post('/registrations/:id/approve', authenticate,
  authorize('adviser','hod','schoolofficer','academicplanning','registry'), approveRegistration)
router.post('/registrations/:id/reject',  authenticate,
  authorize('adviser','hod','schoolofficer','academicplanning','registry'), rejectRegistration)

router.get(   '/users',              authenticate, authorize('admin'), listUsers)
router.get(   '/users/pending-role', authenticate, authorize('admin'), pendingRoleAssignment)
router.patch( '/users/:id',          authenticate, authorize('admin'), updateUser)
router.patch( '/users/:id/role',     authenticate, authorize('admin'), assignRole)
router.delete('/users/:id',          authenticate, authorize('admin'), deactivateUser)

export default router
