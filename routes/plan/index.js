const express = require('express')
const plan = require('../../models/plan')
const user = require('../../models/user')
const router = express.Router()



router.post('/api/plan/add/:userid/:adminid', async (req,res)=>{
    try{
        let admin_obj = await user.findById(req.params.adminid)
        if(admin_obj!=null && admin_obj.role === 'admin')
        {
            let user_obj = await user.findById(req.params.userid)
            if(user_obj!=null)
            {
                let plan_obj = await plan.findOne({user:user_obj._id,active:true})
                if(plan_obj!=null)
                {
                    plan_obj.duration = plan_obj.duration + req.body.duration 
                    await plan_obj.save()
                }
                else 
                {
                    await plan.create({
                        startDate:Date.now(),
                        active:true,
                        duration:req.body.duration,
                        user:user_obj._id 
                    })
                }
                res.status(200).json({
                    status:'success',
                    message:'Plan Upgraded Successfully!'
                })
            }
            else
            {
                res.status(201).json({
                    status:'fail',
                    message:'Invalid User!'
                })
            }
        }
        else
        {
            res.status(201).json({
                status:'fail',
                message:'Invalid Admin!'
            })
        }
    }
    catch(e){
        res.status(404).json({
            status:'fail',
            message:'Something Went Wrong!'
        })
    }
})

router.get('/api/plan/status/:userid', async (req,res)=>{
        try{
            let user_obj = await user.findById(req.params.userid)
            if(user_obj!=null)
            {
                let plan_expired = false 
                let plan_obj = await plan.findOne({user:req.params.userid,active:true})
                let plan_history_list = await plan.find({user:req.params.userid,active:false})
                let plan_history_public_list = []
                let current_plan = null
                plan_history_list.forEach((p)=>{
                    let start = new Date(p.startDate)
                    let end = new Date(p.startDate)
                    end.setDate(end.getDate()+ p.duration)
                    plan_history_public_list.push({
                        start_date: `${start.getDate()}-${start.getMonth()+1}-${start.getFullYear()}`,
                        end_date:`${end.getDate()}-${end.getMonth()+1}-${end.getFullYear()}`,
                        duration: p.duration,
                        status: p.active 
                    })
                })
                if(plan_obj!=null)
                {
                    let validity = new Date(plan_obj.startDate)
                    validity.setDate(validity.getDate()+plan_obj.duration)
                    let present = new Date(Date.now())
                    if(present > validity)
                    {
                        plan_obj.active = false;
                        await plan_obj.save()
                        plan_expired = true
                    }
                    else
                    {
                        let start = new Date(plan_obj.startDate)
                        let end = new Date(plan_obj.startDate)
                        end.setDate(end.getDate()+ plan_obj.duration)
                        current_plan = {
                            start_date: `${start.getDate()}-${start.getMonth()+1}-${start.getFullYear()}`,
                            end_date:`${end.getDate()}-${end.getMonth()+1}-${end.getFullYear()}`,
                            duration: plan_obj.duration,
                            status: plan_obj.active 
                        }
                    }
                }
                else
                {
                    plan_expired = true 
                }
                if(plan_expired===true)
                {
                    res.status(200).json({
                        status:'success',
                        data:{
                            login:true,
                            plan:false,
                            name:user_obj.name,
                            email:user_obj.email,
                            phoneNumber:user_obj.phoneNumber,
                            user_role:user_obj.role,
                            changedPassword:user_obj.changedPassword,
                            current_plan:current_plan,
                            previous_plans: plan_history_public_list.length > 0? plan_history_public_list : null 
                        },
                        message:'user have no active plan to use the software!'
                    })
                }
                else
                {
                    res.status(200).json({
                        status:'success',
                        data:{
                            login:true,
                            plan:true,
                            name:user_obj.name,
                            email:user_obj.email,
                            phoneNumber:user_obj.phoneNumber,
                            user_role:user_obj.role,
                            changedPassword:user_obj.changedPassword,
                            current_plan:current_plan,
                            previous_plans: plan_history_public_list.length > 0? plan_history_public_list : null 
                        },
                        message:'user have valid plan to use the software!'
                    })
                }
            }
        }
        catch{
            res.status(404).json({
                status:'fail',
                message:'Something Went Wrong!'
            })
        }
})



router.delete('/api/plan/remove/:userid/:adminid',async (req,res)=>{
    try{
        let admin_obj = await user.findById(req.params.adminid)
        if(admin_obj!=null && admin_obj.role === 'admin')
        {
            let user_obj = await user.findById(req.params.userid)
            if(user_obj!=null)
            {
                let plan_obj = await plan.findOne({user:user_obj._id,active:true})
                if(plan_obj!=null)
                {
                    plan_obj.active = false 
                    await plan_obj.save()
                    res.status(200).json({
                        status:'success',
                        message:'Plan Removed Successfully!'
                    })
                }
                else 
                {
                    res.status(201).json({
                        status:'success',
                        message:'Already no active plans for this user!'
                    })
                }
               
            }
            else 
            {
                res.status(201).json({
                    status:'fail',
                    message:'Invalid User!'
                }) 
            }
        }
        else
        {
            res.status(201).json({
                status:'fail',
                message:'Invalid Admin!'
            }) 
        }
    }
    catch(e){
        res.status(404).json({
            status:'fail',
            message:'Something went wrong!'
        })
    }
})



module.exports = router 
