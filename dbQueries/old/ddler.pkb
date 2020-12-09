CREATE OR REPLACE PACKAGE DDLER
is
   function getddl ( p_owner in varchar2, p_type in varchar2, p_name in varchar2 ) return clob;
end DDLER;
/

CREATE OR REPLACE PACKAGE BODY DDLER
is
   function getddl ( p_owner in varchar2, p_type in varchar2, p_name in varchar2 ) return clob
   is
   
   begin
      DBMS_METADATA.set_transform_param (DBMS_METADATA.session_transform, 'SQLTERMINATOR', true);
      DBMS_METADATA.set_transform_param (DBMS_METADATA.session_transform, 'PRETTY', true);
      return DBMS_METADATA.get_ddl ( object_type => replace(p_type,' ','_')
             ,                       name        => p_name
             ,                       schema      => p_owner
             ,                       transform   => 'DDL');               
   end getddl;
end DDLER;
/