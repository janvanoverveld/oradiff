


select obj.owner, obj.object_type, obj.object_name
, DBMS_METADATA.get_ddl (replace(obj.object_type,' ','_'), obj.object_name, USER) as ddl
, DDLER.getddl ( p_owner => obj.owner, p_type => obj.object_type, p_name => obj.object_name ) as ddl2
from dba_objects obj
where obj.object_name = 'SAMPLE_PKG'
order by 1,2,3
;






select obj.owner, obj.object_type, obj.object_name
from dba_objects obj
where obj.object_name = 'SAMPLE_PKG'
order by 1,2,3
;

select DDLER.getddl ( p_owner => obj.owner
,                     p_type  => obj.object_type
,                     p_name  => obj.object_name ) as ddlstring
, obj.*
from dba_objects obj
where obj.object_name = 'DUMMY_PKG'
;

declare
   l_ddl clob;
   l_fn  varchar2(1000);
   cursor c_obj
   is
     select obj.owner, obj.object_type, obj.object_name
     from dba_objects obj
     where obj.object_name = 'DUMMY_PKG'
     order by 1,2,3;
begin
   for r in c_obj loop
      ddler.getddl ( p_owner    => r.owner
      ,              p_type     => r.object_type
      ,              p_name     => r.object_name
      ,              p_filename => l_fn
      ,              p_ddl      => l_ddl );
      --dbms_output.put_line(l_fn);
      dbms_output.put_line(l_ddl);
   end loop;
end;
/





