import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Post from 'App/Models/Post'
import PostSortingValidator from 'App/Validators/PostSortingValidator';
import PostValidator from 'App/Validators/PostValidator'
import UpdatePostValidator from 'App/Validators/UpdatePostValidator';

export default class PostsController {
    public async  index({request,response}:HttpContextContract) {
        const validated = await request.validate(PostSortingValidator)
        let sortBy = validated.sortBy || 'created_at'
        let orderBy = validated.orderBy || 'desc'
        const page = request.input('page',1)
        const limit = request.input('limit',10)
        const userId = request.input('user_id')
        const categoryId = request.input('category_id')
        const posts = await Post.query().
            if(userId,(query) => {
                query.where('user_id',userId)
            }).
            if(categoryId,(query) => {
                query.where('category_id',categoryId)
            })
            .orderBy(sortBy,orderBy)
            .preload('user')
            .preload('category')
            .preload('comments')
            .paginate(page,limit)
        return response.ok(posts)
    }
    public async store({request,auth,response}:HttpContextContract){
        const validatedData = await request.validate(PostValidator)
        const post = await auth.user?.related('posts').create(validatedData)
        await post?.preload('user')
        await post?.preload('category')
        await post?.preload('comments')
        return response.created({data: post})
    }
    public async show({params,response}:HttpContextContract){
        const post = await Post.findOrFail(params.id)
        await post.preload('user')
        await post.preload('category')
        await post.preload('comments')
        return response.ok({data: post})
    }
    public async update({request,params,response}:HttpContextContract) {
        const post = await Post.findOrFail(params.id)
        const validatedData = await request.validate(UpdatePostValidator);
        post.merge(validatedData)
        await post.save()
        await post.preload('user')
        await post.preload('category')
        await post.preload('comments')
        return response.ok({data: post})
    }
    public async destroy({params,response}:HttpContextContract){
        const post = await Post.findOrFail(params.id)
        await post.delete()
        return response.noContent()
    }
}
