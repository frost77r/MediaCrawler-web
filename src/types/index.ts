export interface Log {
  id: number;
  timestamp: string;
  level: string;
  message: string;
}

export interface CrawlerStatus {
  status: 'idle' | 'running' | 'stopping' | 'error';
}

export interface CrawlerStartRequest {
  platform: string;
  crawler_type: string;
  login_type: string;
  save_option: string;
  keywords?: string;
  sort_type?: string;
  specified_ids?: string;
  creator_ids?: string;
  enable_comments?: boolean;
  enable_sub_comments?: boolean;
  headless?: boolean;
  cdp?: boolean;
  cdp_headless?: boolean;
  start_page?: number;
  max_notes?: number;
  concurrency?: number;
  enable_media?: boolean;
  max_comments?: number;
  wordcloud?: boolean;
}

export interface Note {
  id?: string | number;
  user_id?: string;
  nickname?: string;
  avatar?: string;
  ip_location?: string;
  add_ts?: number | string;
  last_modify_ts?: number | string;
  note_id?: string;
  type?: string;
  title?: string;
  desc?: string;
  video_url?: string;
  time?: number | string;
  last_update_time?: number | string;
  liked_count?: number;
  collected_count?: number;
  comment_count?: number;
  share_count?: number;
  image_list?: string[];
  tag_list?: string[];
  note_url?: string;
  source_keyword?: string;
  xsec_token?: string;
  audit_status?: number;
  audit_reason?: string;

  // compatibility fields
  aweme_id?: string;
  aid?: string;
  video_id?: string;
  note_title?: string;
  note_desc?: string;
  content?: string;
  user?: { nickname: string };
  author?: string;
  like_count?: number;
  digg_count?: number;
  comments_count?: number;
  create_time?: number | string;
}

export interface Comment {
  id?: string | number;
  user_id?: string;
  nickname?: string;
  avatar?: string;
  ip_location?: string;
  add_ts?: number | string;
  last_modify_ts?: number | string;
  comment_id?: string;
  create_time?: number | string;
  note_id?: string;
  content?: string;
  sub_comment_count?: number;
  pictures?: string;
  parent_comment_id?: string;
  like_count?: number;

  // compatibility fields
  aweme_id?: string;
  video_id?: string;
  user_nickname?: string;
  commenter?: string;
  text?: string;
  comment_content?: string;
  digg_count?: number;
  liked_count?: number;
  time?: number | string;
}

export interface Clue {
  id?: number;
  clue_no?: string;
  clue_title?: string;
  clue_desc?: string;
  target_user_id?: string;
  target_user_nickname?: string;
  source_type?: string; // 'note' | 'comment' | 'manual' | 'rule'
  source_keyword?: string;
  hit_rule_code?: string;
  hit_rule_name?: string;
  suspicious_reason?: string;
  evidence_summary?: string;
  risk_level?: number;
  status?: number;
  handler?: string;
  handle_result?: string;
  create_time?: number;
  update_time?: number;
  discover_time?: number;
  platform?: string;

  // added for UI display
  related_note_count?: number;
  related_comment_count?: number;
  source_note_id?: string;
  source_comment_id?: string;
  source_content_summary?: string;

  // for form submission
  note_ids?: string[];
  comment_ids?: string[];
}

export interface ClueNoteRel {
  id?: number;
  clue_id?: number;
  note_id: string;
  relation_type?: string;
  evidence_flag?: number;
  remark?: string;
  note?: Note;
}

export interface ClueCommentRel {
  id?: number;
  clue_id?: number;
  comment_id: string;
  note_id?: string;
  relation_type?: string;
  evidence_flag?: number;
  remark?: string;
  comment?: Comment;
}

export interface ClueDetail extends Clue {
  notes?: ClueNoteRel[];
  comments?: ClueCommentRel[];
  logs?: any[]; // for handle history
}
