import React, { useContext, useState } from 'react';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Card, Form, Grid,Icon,Image, Label, Placeholder, Popup, Segment } from 'semantic-ui-react';
import moment from 'moment';
import LikeButton from '../components/LikeButton';
import { AuthContext } from '../context/auth';
import DeletButton from '../components/DeletButton';

function SinglePost(props) {
    const {user} = useContext(AuthContext);
    const postId  = props.match.params.postId;


    const {data} = useQuery(FETCH_POST_QUERY,{
        variables:{
            postId
        }
    });
    const [coment,setComent] = useState('');

    const [submitComment] = useMutation(SUBMIT_COMMENT_MUTATION,{
        update(){
            setComent('');
        },
        variables:{
            postId,
            body:coment
        }
    });
    function deletePostCallback(){
        props.history.push('/');
    }
    const getPost = data?.getPost;
    let postMarkup;
    if(!getPost){
        postMarkup =    <Grid.Column>
                            <Segment raised>
                                <Placeholder>
                                    <Placeholder.Header image>
                                    <Placeholder.Line />
                                    <Placeholder.Line />
                                    </Placeholder.Header>
                                    <Placeholder.Paragraph>
                                    <Placeholder.Line length='medium'/>
                                    <Placeholder.Line length='short' />
                                    </Placeholder.Paragraph>
                                </Placeholder>
                            </Segment>
                        </Grid.Column>
    }
    else{
        const {id,body,createdAt,username,
        comments,likes,likeCount,commentCount} = getPost;
        postMarkup = (
            <Grid>
                <Grid.Row>
                    <Grid.Column width = {2}>
                        <Image
                            src="https://react.semantic-ui.com/images/avatar/large/molly.png"
                            size="small"
                            float = "right"
                    />
                    </Grid.Column>
                    <Grid.Column width = {10}>
                        <Card fluid>
                            <Card.Content>
                                <Card.Header>
                                    {username}
                                </Card.Header>
                                <Card.Meta>
                                    {moment(createdAt).fromNow()}
                                </Card.Meta>
                                <Card.Description>
                                    {body}
                                </Card.Description> 
                            </Card.Content>
                            <hr/>
                            <Card.Content extra>
                                <LikeButton user={user} post={{id,likes,likeCount}}/> 
                                <Popup content = "Comment on post"
                                    inverted
                                    trigger = {
                                    <Button as ="div" labelPosition="right"
                                     onClick = {()=> console.log('comment on post')}   
                                    >
                                    
                                    <Button basic color = "teal">
                                        <Icon name = "comments"/>
                                    </Button>
                                    <Label basic color="blue" pointing="left">
                                        {commentCount}
                                    </Label>
                                    </Button>
                                    
                                    }
                                />
                                {user && username && user?.username===username && (
                                    <DeletButton postId = {id} callback = {deletePostCallback}/>
                                )}
                            </Card.Content>
                        </Card>
                        {user && (
                            <Card fluid>
                                <Card.Content>
                                    <p>Post a comment...</p>
                                    <Form>
                                        <div class = "ui action input fluid">
                                            <input type ="text"
                                                placeholder="Comment.."
                                                name="comment"
                                                value = {coment}
                                                onChange = {e => setComent(e.target.value)} 
                                            />
                                            <button type = "submit" className = "ui button teal"
                                                disabled = {coment.trim() === ''}
                                                onClick = {submitComment}
                                            ><strong style = {{color:"white"}}>Submit</strong></button>
                                        </div>
                                    </Form>    
                                </Card.Content>
                             </Card>
                        )}
                        {comments.map((comment) =>{
                            return <Card fluid>
                                <Card.Content>
                                    {user && user.username === comment.username && (
                                        <DeletButton postId= {id} commentId = {comment.id}/>
                                    )}
                                    <Card.Header>{comment.username}</Card.Header>
                                    <Card.Meta>{moment(comment.createdAt).fromNow()}</Card.Meta>
                                    <Card.Description>{comment.body}</Card.Description>
                           </Card.Content>
                            </Card> 
                        })}


                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }


    return postMarkup;
}


const SUBMIT_COMMENT_MUTATION  = gql`
    mutation($postId:ID!,$body:String!){
        createComment(postId:$postId,body:$body){
            id
            comments{
                id
                body
                createdAt
                username
            }
            commentCount
        }
    }

`;


const FETCH_POST_QUERY = gql`
    query($postId:ID!){
        getPost(postId:$postId){
            id
            body
            createdAt
            username
            likeCount
            likes{
                username
            }
            commentCount
            comments{
                id
                username
                createdAt
                body
            }
        }
    }
`;

export default SinglePost;