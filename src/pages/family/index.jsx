import { useCallback, useState } from 'react';
import { Button, Input, Picker, Text, View } from '@tarojs/components';
import SectionBlock from '../../components/section-block';
import LoadingState from '../../components/loading-state';
import { createBook, createMember, fetchMembers, joinBook } from '../../api/modules/book';
import { getSession, setSession } from '../../services/session';
import { EVENTS, dispatchEvent } from '../../services/events';
import { usePageRefresh } from '../../services/use-page-refresh';
import { showError } from '../../api/client';
import './index.scss';

const roles = ['member', 'read', 'admin'];
const roleText = {
  member: '普通成员',
  read: '只读成员',
  admin: '管理员'
};

export default function FamilyPage() {
  const [session, setLocalSession] = useState(getSession());
  const [members, setMembers] = useState([]);
  const [bookName, setBookName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [roleIndex, setRoleIndex] = useState(0);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      const current = getSession();
      setLocalSession(current);
      const activeBook = current.books.find((item) => item.id === current.activeBookId);
      if (!activeBook || activeBook.bookType !== 'family') {
        setMembers([]);
        return;
      }
      const rows = await fetchMembers(activeBook.id);
      setMembers(rows);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  usePageRefresh(loadMembers, [EVENTS.SESSION_UPDATED, EVENTS.MEMBER_UPDATED, EVENTS.BOOK_UPDATED]);

  async function createFamilyBook() {
    if (!bookName.trim() || !session.user) return;
    try {
      const created = await createBook({ userId: session.user.id, name: bookName.trim(), bookType: 'family' });
      const next = setSession({ books: [...session.books, created], activeBookId: created.id });
      setLocalSession(next);
      setBookName('');
      dispatchEvent(EVENTS.BOOK_UPDATED, { type: 'create' });
      loadMembers();
    } catch (error) {
      showError(error);
    }
  }

  async function addMember() {
    if (!memberName.trim() || !session.activeBookId) return;
    try {
      await createMember(session.activeBookId, { nickname: memberName.trim(), role: roles[roleIndex] });
      setMemberName('');
      dispatchEvent(EVENTS.MEMBER_UPDATED, { type: 'add' });
      loadMembers();
    } catch (error) {
      showError(error);
    }
  }

  async function joinByCode() {
    if (!inviteCode.trim() || !session.user) return;
    try {
      const data = await joinBook({ inviteCode: inviteCode.trim(), userId: session.user.id });
      const exists = session.books.some((item) => item.id === data.book.id);
      const nextBooks = exists ? session.books : [...session.books, data.book];
      const next = setSession({ books: nextBooks, activeBookId: data.book.id });
      setLocalSession(next);
      setInviteCode('');
      dispatchEvent(EVENTS.BOOK_UPDATED, { type: 'join' });
      loadMembers();
    } catch (error) {
      showError(error);
    }
  }

  const activeBook = session.books.find((item) => item.id === session.activeBookId);

  return (
    <View className='ios-page'>
      <SectionBlock title='当前家庭账本'>
        <Text>{activeBook?.name || '当前不是家庭账本，请先创建或加入'}</Text>
        {activeBook?.inviteCode ? <Text className='ios-tag'>邀请码：{activeBook.inviteCode}</Text> : null}
      </SectionBlock>

      <SectionBlock title='创建家庭账本'>
        <Input className='ios-input' placeholder='输入家庭账本名称' value={bookName} onInput={(e) => setBookName(e.detail.value)} />
        <Button type='primary' onClick={createFamilyBook}>创建</Button>
      </SectionBlock>

      <SectionBlock title='加入家庭账本'>
        <Input className='ios-input' placeholder='输入邀请码' value={inviteCode} onInput={(e) => setInviteCode(e.detail.value)} />
        <Button onClick={joinByCode}>加入</Button>
      </SectionBlock>

      <SectionBlock title='成员管理'>
        <View className='familyRow'>
          <Input className='ios-input' placeholder='成员昵称' value={memberName} onInput={(e) => setMemberName(e.detail.value)} />
          <Picker mode='selector' range={roles.map((r) => roleText[r])} value={roleIndex} onChange={(e) => setRoleIndex(Number(e.detail.value))}>
            <View className='ios-picker'>{roleText[roles[roleIndex]]}</View>
          </Picker>
        </View>
        <Button onClick={addMember}>添加成员</Button>

        {loading ? <LoadingState text='正在加载成员...' /> : null}
        {!loading && members.length === 0 ? <Text className='ios-empty'>暂无成员</Text> : null}
        {!loading
          ? members.map((item) => (
              <View key={item.id} className='memberItem'>
                <Text>{item.user.nickname}</Text>
                <Text className='ios-subtitle'>{roleText[item.role] || item.role}</Text>
              </View>
            ))
          : null}
      </SectionBlock>
    </View>
  );
}


